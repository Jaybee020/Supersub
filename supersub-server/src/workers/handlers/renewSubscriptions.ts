import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { type Chain } from 'viem/chains';
import dayjs from 'dayjs';

import { SUBSCRIPTION_PLUGIN_ADDRESS, SubscriptionPluginAbi, getEvmHttpClient } from '~/pkg/evm';
import { logger } from '~/pkg/logging';
import { config } from '~/pkg/env';
import { prisma } from '~/pkg/db';

export const renewSubscriptions = async (chain: Chain) => {
  try {
    logger.info('Checking for subscriptions to renew');

    const now = dayjs();
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            createdAt: { lt: now.subtract(1, 'hour').toDate() },
            lastChargeDate: null,
          },
          {
            lastChargeDate: { lt: now.toDate() },
          },
        ],
        subscriptionExpiry: { lt: now.toDate() },
        product: { isActive: true },
        plan: { isActive: true },
        isActive: true,
      },
      include: {
        product: true,
        plan: true,
      },
    });

    if (activeSubscriptions.length === 0) {
      logger.info('No subscriptions found for renewal');
      return;
    }

    const subscriptionsForRenewal = activeSubscriptions.filter((sub) => {
      if (!sub.lastChargeDate) return true;
      return sub.lastChargeDate < now.subtract(sub.plan.chargeInterval, 'seconds').toDate();
    });

    logger.info('Renewing subscriptions', { numSubscriptions: subscriptionsForRenewal.length });
    const chargeResults = await Promise.allSettled(
      subscriptionsForRenewal.map(
        async (sub) => await chargeUser(chain, sub.beneficiaryAddress as `0x${string}`, BigInt(sub.plan.id)),
      ),
    );

    const successfulCharges = chargeResults.filter((result) => result.status === 'fulfilled');
    const failedCharges = chargeResults.filter((result) => result.status === 'rejected');

    if (successfulCharges.length > 0) {
      logger.info('Subscriptions renewed successfully', { numSuccessful: successfulCharges.length });
    }

    // todo: handle retries for failed renewals & suspend subscriptions.
    if (failedCharges.length > 0) {
      logger.info('Failed to renew some subscriptions', { numFailed: failedCharges.length });
    }
  } catch (error) {
    logger.error(error, { description: 'Error renewing subscriptions' });
  }
};

const chargeUser = async (chain: Chain, beneficiary: `0x${string}`, planId: bigint) => {
  try {
    const publicClient = getEvmHttpClient(chain);
    const account = privateKeyToAccount(config.PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      transport: http(),
      account,
      chain,
    });

    const { request } = await publicClient.simulateContract({
      address: SUBSCRIPTION_PLUGIN_ADDRESS,
      args: [planId, beneficiary],
      abi: SubscriptionPluginAbi,
      functionName: 'charge',
      account,
    });

    logger.info('Charging user for subscription', { beneficiary, planId });
    await walletClient.writeContract(request);
  } catch (error) {
    logger.error(error, { description: 'Error charging user for subscription', beneficiary, planId });
  }
};
