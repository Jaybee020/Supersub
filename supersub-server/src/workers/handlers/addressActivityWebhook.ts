import { zeroAddress, getAddress, fromHex } from 'viem';
import { baseSepolia, polygonAmoy } from 'viem/chains';

import { getDeploymentVarsByChain } from '~/pkg/evm/constants';
import { AlchemyWebhookEvent } from '~/utils';
import { logger } from '~/pkg/logging';
import { prisma } from '~/pkg/db';

const ModularAccountFactoryAddress = getAddress('0x0046000000000151008789797b54fdb500e2a61e');

const getChainID = (name: string) => {
  const mapping: Record<string, number> = {
    BASE_SEPOLIA: baseSepolia.id,
    MATIC_AMOY: polygonAmoy.id,
  };
  return mapping[name];
};

export const handleAlchemyAddressActivityWebhook = async (webhook: AlchemyWebhookEvent) => {
  try {
    if (webhook.type !== 'ADDRESS_ACTIVITY') {
      logger.info(`Ignoring webhook event of type ${webhook.type} for network ${webhook.event.network}`);
      return;
    }

    for (const activity of webhook.event.activity) {
      if (!['internal', 'external', 'token'].includes(activity.category)) {
        logger.warn(`No handler found for activity with category: ${activity.category}`);
        continue;
      }
      console.log(activity);

      const toAddress = getAddress(activity.toAddress);
      const fromAddress = getAddress(activity.fromAddress);
      const chainId = getChainID(webhook.event.network);
      const susbscriptionPluginAddr = getDeploymentVarsByChain(String(chainId)).subscriptionPlugin;
      if (
        [ModularAccountFactoryAddress].includes(toAddress) ||
        [ModularAccountFactoryAddress, susbscriptionPluginAddr].includes(fromAddress)
      ) {
        logger.info(`Ignoring activity involving Modular Account Factory or Subscription Plugin`);
        continue;
      }

      if (activity.value === 0) {
        logger.info(`Ignoring zero value activity with hash: ${activity.hash}`);
        continue;
      }

      const tokenAddress = activity.rawContract.address
        ? getAddress(activity.rawContract.address as `0x${string}`)
        : zeroAddress;
      const amount = fromHex(activity.rawContract.rawValue as `0x${string}`, 'bigint').toString();

      const withdrawalNarration = `Withdrawal`;
      const depositNarration = `Deposit`;

      await prisma.token.createMany({
        data: [
          {
            onchainReference: `${chainId}:${tokenAddress}`,
            address: tokenAddress,
            chainId: chainId,
          },
        ],
        skipDuplicates: true,
      });

      await prisma.transaction.createMany({
        data: [
          {
            tokenOnchainReference: `${chainId}:${tokenAddress}`,
            onchainReference: `${chainId}:${activity.hash}`,
            narration: withdrawalNarration,
            recipient: toAddress,
            sender: fromAddress,
            type: 'WITHDRAWAL',
            status: 'SUCCESS',
            chainId: chainId,
            tokenAddress,
            amount,
          },
          {
            tokenOnchainReference: `${chainId}:${tokenAddress}`,
            onchainReference: `${chainId}:${activity.hash}`,
            narration: depositNarration,
            recipient: toAddress,
            sender: fromAddress,
            status: 'SUCCESS',
            chainId: chainId,
            type: 'DEPOSIT',
            tokenAddress,
            amount,
          },
        ],
        skipDuplicates: true,
      });

      logger.info(`Successfully processed activity with hash: ${activity.hash}`);
    }
  } catch (error) {
    logger.error('Error processing Alchemy address activity webhook', { webhook, error });
  }
};
