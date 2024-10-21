import {
  arbitrumSepolia,
  optimismSepolia,
  fraxtalTestnet,
  baseSepolia,
  polygonAmoy,
  type Chain,
  sepolia,
} from 'viem/chains';
import {
  getDefaultMultiOwnerModularAccountFactoryAddress,
  MultiOwnerModularAccountFactoryAbi,
} from '@alchemy/aa-accounts';
import { createPublicClient, fromHex, http } from 'viem';
import { Alchemy, Network } from 'alchemy-sdk';
import { getChain } from '@alchemy/aa-core';
import dayjs from 'dayjs';

import { ALCHEMY_WEBHOOK_ID } from '~/pkg/evm';
import { config } from '~/pkg/env';

export const getAlchemyClient = (network: Network) => {
  return new Alchemy({ authToken: config.ALCHEMY_AUTH_TOKEN, apiKey: config.ALCHEMY_API_KEY, network });
};

const getTransportURL = (chainId: number) => {
  switch (chainId) {
    case baseSepolia.id:
      return 'https://base-sepolia.g.alchemy.com/v2/GAG9zhOv7cSHQdF77ZD3L27aN4JGiwGm';
    case optimismSepolia.id:
      return '';
    case fraxtalTestnet.id:
      return '';
    case arbitrumSepolia.id:
      return '';
    case polygonAmoy.id:
      return '';
    case sepolia.id:
      return '';
    default:
      return 'https://base-sepolia.g.alchemy.com/v2/GAG9zhOv7cSHQdF77ZD3L27aN4JGiwGm';
  }
};
export const getEvmHttpClient = (chain: Chain) => {
  const transportURL = getTransportURL(chain.id);
  return createPublicClient({
    transport: http(transportURL),
    chain,
  });
};

export const getMultiOwnerModularAccountAddresses = async (chain: Chain, owners: `0x${string}`[]) => {
  const client = getEvmHttpClient(chain);
  const viemToAlchemyChain = getChain(chain.id);
  const factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(viemToAlchemyChain);
  const factoryContract = { abi: MultiOwnerModularAccountFactoryAbi, address: factoryAddress } as const;

  const calls = owners.map((owner) => ({
    ...factoryContract,
    functionName: 'getAddress',
    args: [0n, [owner]],
  }));

  const results = await client.multicall({ contracts: calls });
  return results.reduce(
    (acc, result, index) => {
      if (result.status === 'success') {
        acc[owners[index]] = result.result as `0x${string}`;
      }
      return acc;
    },
    {} as Record<`0x${string}`, `0x${string}`>,
  );
};

export const hexToString = (hex: `0x${string}`): string => fromHex(hex, 'string');

export const solidityTimestampToDateTime = (ts: bigint): Date => {
  return dayjs.unix(Number(ts)).toDate();
};

export const bytes32ToText = (hex: `0x${string}`): string => fromHex(hex, { to: 'string', size: 32 });

export const addAddressesToWebhook = async (addresses: `0x${string}`[], network: Network) => {
  if (config.ENVIRONMENT === 'development') return;

  const client = getAlchemyClient(network);

  await client.notify.updateWebhook(ALCHEMY_WEBHOOK_ID, { addAddresses: addresses });
};
