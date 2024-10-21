import { zeroAddress, erc20Abi } from 'viem';
import { type Chain } from 'viem/chains';

import { getEvmHttpClient } from '~/pkg/evm';
import { logger } from '~/pkg/logging';
import { prisma } from '~/pkg/db';

export const enrichERC20Tokens = async (chain: Chain) => {
  try {
    logger.info('Fetching tokens with missing data from the database');
    const tokens = await prisma.token.findMany({ where: { chainId: chain.id, decimals: null } });

    if (tokens.length === 0) {
      logger.info('No tokens found with missing data');
      return;
    }

    // todo: if we eventually do multi-chain support, this will need to change.
    try {
      await prisma.token.update({
        data: { decimals: chain.nativeCurrency.decimals, symbol: chain.nativeCurrency.symbol },
        where: { onchainReference: `${chain.id}:${zeroAddress}` },
      });
    } catch (e) {
      // do nothing
    }

    logger.info('Preparing multicall requests', { numTokens: tokens.length });
    const client = getEvmHttpClient(chain);
    const calls = tokens.map((token) => {
      const contract = { address: token.address as `0x${string}`, abi: erc20Abi } as const;
      if (token.address === zeroAddress) return [];

      return [
        { ...contract, functionName: 'decimals' },
        { ...contract, functionName: 'symbol' },
      ];
    });

    logger.info('Executing multicall requests');
    const results = await client.multicall({ contracts: calls.flat() });

    const dbActions = [];
    for (let i = 0; i < results.length; i += 2) {
      const [decimalsResult, symbolResult] = results.slice(i, i + 2);

      if (decimalsResult.status !== 'success' || symbolResult.status !== 'success') {
        logger.warn('Failed to fetch token data', {
          tokenAddress: tokens[i / 2].address,
          decimalsResult,
          symbolResult,
        });
        continue;
      }

      dbActions.push(
        prisma.token.update({
          data: { decimals: Number(decimalsResult.result), symbol: symbolResult.result as string },
          where: { onchainReference: tokens[i / 2].onchainReference },
        }),
      );
    }

    logger.info('Updating tokens in the database', { numTokens: dbActions.length });
    await prisma.$transaction(dbActions);
  } catch (error) {
    logger.error(error, { description: 'Error enriching ERC20 tokens' });
  }
};
