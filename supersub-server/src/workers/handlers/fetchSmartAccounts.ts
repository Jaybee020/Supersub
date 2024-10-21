import { type User } from '@privy-io/server-auth';
import { type Chain } from 'viem/chains';
import { Network } from 'alchemy-sdk';

import { getMultiOwnerModularAccountAddresses, addAddressesToWebhook } from '~/pkg/evm';
import { getUniqueElements } from '~/utils';
import { logger } from '~/pkg/logging';
import { privy } from '~/pkg/privy';
import { prisma } from '~/pkg/db';

export const fetchSmartAccounts = async (chain: Chain, alchemyNetwork: Network) => {
  try {
    logger.info('Fetching Privy users');
    const privyUsers = await privy.getUsers();

    const usersByWalletAddress = privyUsers.reduce(
      (mapping, user) => {
        if (user.wallet) {
          const { wallet, ...rest } = user;
          mapping[wallet.address as `0x${string}`] = rest;
        }
        return mapping;
      },
      {} as Record<`0x${string}`, Omit<User, 'wallet'>>,
    );

    logger.info('Fetching accounts from the database');
    const accountsInDb = await prisma.account.findMany({ select: { eoaAddress: true } });
    const addressesInDb = accountsInDb.map((account) => account.eoaAddress as `0x${string}`);

    logger.info('Identifying new wallet addresses');
    const newWalletAddresses = getUniqueElements<`0x${string}`>(
      Object.keys(usersByWalletAddress) as `0x${string}`[],
      addressesInDb,
    );

    if (newWalletAddresses.length > 0) {
      logger.info('Fetching modular account addresses for new wallets', { newWalletAddresses });
      const modularAccountAddressesForNewWallets = await getMultiOwnerModularAccountAddresses(
        chain,
        newWalletAddresses,
      );

      logger.info('Creating new accounts in the database');
      await addAddressesToWebhook(Object.values(modularAccountAddressesForNewWallets), alchemyNetwork);
      await prisma.account.createMany({
        data: Object.entries(modularAccountAddressesForNewWallets).map(([walletAddress, modularAccountAddress]) => ({
          emailAddress: usersByWalletAddress[walletAddress as `0x${string}`].email?.address as string,
          metadata: { privyDid: usersByWalletAddress[walletAddress as `0x${string}`].id },
          smartAccountAddress: modularAccountAddress,
          eoaAddress: walletAddress,
        })),
        skipDuplicates: true,
      });
    }
  } catch (error) {
    logger.error(error, { description: 'Error fetching smart accounts' });
  }
};
