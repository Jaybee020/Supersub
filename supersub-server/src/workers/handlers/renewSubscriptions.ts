import { providers, Contract, Wallet } from 'ethers';
import { Subscription, Plan } from '@prisma/client';
import { type Chain } from 'viem/chains';
import dayjs from 'dayjs';

import { getDeploymentVarsByChain } from '~/pkg/evm/constants';
import { RequestProvider } from '~/pkg/request/main';
import { SubscriptionPluginAbi } from '~/pkg/evm';
import { getRPCUrl, config } from '~/pkg/env';
import { logger } from '~/pkg/logging';
import { resend } from '~/pkg/resend';
import { prisma } from '~/pkg/db';

import { getChargeNotificationBodyTemplate } from './emailNotification';

export const renewSubscriptions = async (chain: Chain) => {
  try {
    logger.info('Checking for subscriptions to renew');

    const now = dayjs();
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            // createdAt: { lt: now.subtract(1, 'hour').toDate() },
            lastChargeDate: null,
          },
          {
            lastChargeDate: { lt: now.toDate() },
          },
        ],
        // subscriptionExpiry: { lt: now.toDate() },
        product: { isActive: true },
        plan: { isActive: true },
        isActive: true,
      },
      include: {
        product: true,
        plan: true,
      },
    });

    console.log({ activeSubscriptions });

    if (activeSubscriptions.length === 0) {
      logger.info('No subscriptions found for renewal');
      return;
    }

    const subscriptionsForRenewal = activeSubscriptions.filter((sub) => {
      if (!sub.subscriptionExpiry) return true;
      if (!sub.lastChargeDate) return true;
      if (sub.subscriptionExpiry < now.toDate()) return false;
      return sub.lastChargeDate < now.subtract(sub.plan.chargeInterval, 'seconds').toDate();
    });

    logger.info('Renewing subscriptions', { numSubscriptions: subscriptionsForRenewal.length });
    const chargeResults = await Promise.allSettled(
      subscriptionsForRenewal.map(async (sub) => await chargeUser(chain, sub, sub.plan)),
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

const chargeUser = async (chain: Chain, subscription: Subscription, plan: Plan) => {
  try {
    let paymentReference;
    if (subscription.paymentTokenAddress === plan.tokenAddress) {
      const requestProvider = new RequestProvider(chain.name.toLowerCase());
      if (subscription.paymentTokenAddress === '0x0000000000000000000000000000000000000000') {
        const { requestData } = await requestProvider.createNativeTokenPaymentRequest(
          subscription.subscriberAddress,
          plan.receivingAddress,
          plan.price.toString(),
          config.FEE_PERCENTAGE,
        );
        console.log({ requestData });
        paymentReference = await requestProvider.generateRequestPaymentReference(requestData);
      } else {
        const { requestData } = await requestProvider.createERC20PaymentRequest(
          subscription.subscriberAddress,
          plan.tokenAddress,
          plan.receivingAddress,
          plan.price.toString(),
          config.FEE_PERCENTAGE,
        );
        console.log({ requestData });
        paymentReference = await requestProvider.generateRequestPaymentReference(requestData);
      }
    }

    console.log({ paymentReference });

    // const { request } = await publicClient.simulateContract({
    //   args: [
    //     BigInt(plan.id),
    //     subscription.beneficiaryAddress as `0x${string}`,
    //     config.FEE_RECIPIENT as `0x${string}`,
    //     config.FEE_PERCENTAGE,
    //     (paymentReference || '0x') as `0x${string}`,
    //   ],
    //   address: getDeploymentVarsByChain(chain.id).subscriptionPlugin as `0x${string}`,
    //   abi: SubscriptionPluginAbi,
    //   functionName: 'charge',
    //   account,
    // });

    // console.log('Successfully simulated charge', request);

    // const estimatedGas = await publicClient.estimateContractGas(request);
    // const gasPrice = await publicClient.getGasPrice();
    // console.log({ estimatedGas, gasPrice });
    const planOnchainId = plan.onchainReference.split(':')[1];

    logger.info('Charging user for subscription', {
      beneficiary: subscription.beneficiaryAddress,
      planId: planOnchainId,
    });
    // await walletClient.writeContract({ gas: estimatedGas, ...request });

    const provider = new providers.JsonRpcProvider(getRPCUrl(chain.name));
    const wallet = new Wallet(config.PRIVATE_KEY as `0x${string}`, provider);
    const subscriptionContract = new Contract(
      getDeploymentVarsByChain(chain.id).subscriptionPlugin as `0x${string}`,
      SubscriptionPluginAbi,
      wallet,
    );

    const estimatedGas = await subscriptionContract.estimateGas.charge(
      BigInt(planOnchainId),
      subscription.beneficiaryAddress as `0x${string}`,
      config.FEE_RECIPIENT as `0x${string}`,
      config.FEE_PERCENTAGE,
      (paymentReference || '0x') as `0x${string}`,
    );

    console.log({ estimatedGas });
    await subscriptionContract.charge(
      BigInt(planOnchainId),
      subscription.beneficiaryAddress as `0x${string}`,
      config.FEE_RECIPIENT as `0x${string}`,
      config.FEE_PERCENTAGE,
      (paymentReference || '0x') as `0x${string}`,
      {
        gasLimit: estimatedGas,
      },
    );

    // const subscriber = await prisma.account.findUnique({
    //   where: { smartAccountAddress: subscription.subscriberAddress },
    // });
    // if (subscriber && subscriber.emailAddress) {
    //   const chargeNotificationBody = getChargeNotificationBodyTemplate({
    //     url: `https://supersub.com/subscription/${subscription.id}`,
    //     email: subscriber.emailAddress,
    //     chargeStatus: true,
    //   });
    //   await resend.batch.send([
    //     {
    //       subject: 'SuperSub - Subscription Charged',
    //       from: 'SuperSub <onboarding@resend.dev>',
    //       to: [subscriber.emailAddress],
    //       text: chargeNotificationBody,
    //     },
    //   ]);
    // }
  } catch (error) {
    logger.error(error, {
      description: 'Error charging user for subscription',
      beneficiary: subscription.beneficiaryAddress,
      planId: plan.id,
    });

    const subscriber = await prisma.account.findUnique({
      where: { smartAccountAddress: subscription.subscriberAddress },
    });
    if (subscriber && subscriber.emailAddress) {
      const chargeNotificationBody = getChargeNotificationBodyTemplate({
        url: `https://supersub.com/subscription/${subscription.id}`,
        email: subscriber.emailAddress,
        chargeStatus: false,
      });
      await resend.batch.send([
        {
          subject: 'SuperSub - Subscription Charged',
          from: 'SuperSub <onboarding@resend.dev>',
          to: [subscriber.emailAddress],
          text: chargeNotificationBody,
        },
      ]);
    }
  }
};
