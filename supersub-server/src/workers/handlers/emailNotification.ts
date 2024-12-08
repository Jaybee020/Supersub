import { arbitrumSepolia, optimismSepolia, polygonAmoy, baseSepolia, sepolia } from 'viem/chains';
import { fraxtalSepolia } from '@alchemy/aa-core';
import { ProductType } from '@prisma/client';
import { formatUnits } from 'viem';
import dayjs from 'dayjs';

import { logger } from '~/pkg/logging';
import { resend } from '~/pkg/resend';
import { prisma } from '~/pkg/db';
import { chunks } from '~/utils';

const getNetworkNameById = (chainId: string) => {
  const mapping: Record<string, string> = {
    [arbitrumSepolia.id]: arbitrumSepolia.name,
    [optimismSepolia.id]: optimismSepolia.name,
    [fraxtalSepolia.id]: fraxtalSepolia.name,
    [polygonAmoy.id]: polygonAmoy.name,
    [baseSepolia.id]: baseSepolia.name,
    [sepolia.id]: sepolia.name,
  };
  return mapping[chainId];
};

export const notifyUsersForUpcomingSubscriptionRenewal = async () => {
  try {
    logger.info('Checking for upcoming subscription renewals');
    const now = dayjs();
    const in24Hours = now.add(24, 'hours');

    let upcomingRenewals = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            // createdAt: { lt: now.subtract(1, 'hour').toDate() },
            lastChargeDate: null,
          },
          {
            lastChargeDate: { lt: in24Hours.subtract(1, 'seconds').toDate() },
          },
        ],
        // subscriptionExpiry: { lt: now.toDate() },
        product: { isActive: true },
        plan: { isActive: true },
        isActive: true,
      },
      include: {
        plan: { include: { token: true } },
        paymentToken: true,
        product: true,
      },
    });

    upcomingRenewals = upcomingRenewals.filter((sub) => {
      if (!sub.subscriptionExpiry) return true;
      if (!sub.lastChargeDate) return true;
      if (sub.subscriptionExpiry < now.toDate()) return false;
      return sub.lastChargeDate < now.subtract(sub.plan.chargeInterval, 'seconds').toDate();
    });
    if (upcomingRenewals.length === 0) {
      logger.info('No upcoming subscription renewals found');
      return;
    }

    const subscribersToNotify = [];

    for (const renewals of upcomingRenewals) {
      const subscriber = await prisma.account.findUnique({
        where: { smartAccountAddress: renewals.subscriberAddress },
      });
      if (subscriber && subscriber.emailAddress) {
        subscribersToNotify.push({
          ...renewals,
          subscriber,
        });
      }
    }

    logger.info('Preparing email payloads', { numSubscribers: subscribersToNotify.length });
    const payloads = subscribersToNotify.map((subscription) => ({
      text: getEmailBodyTemplate({
        amount: formatUnits(BigInt(subscription.plan.price.toString()), subscription.plan.token.decimals as number),
        paymentChain: getNetworkNameById(subscription.chainId.toString()),
        paymentTokenSymbol: subscription.paymentToken.symbol || '',
        planTokenSymbol: subscription.plan.token.symbol || '',
        recipientAddress: subscription.plan.receivingAddress,
        productDescription: subscription.product.description,
        email: subscription.subscriber.emailAddress,
        productName: subscription.product.name,
        type: subscription.product.type,
      }),
      to: [subscription.subscriber.emailAddress],
      from: 'SuperSub <onboarding@resend.dev>',
      subject: 'SuperSub - Payment Reminder',
    }));

    logger.info('Sending email reminders');
    const payloadChunks = chunks(payloads, 50);
    await Promise.allSettled(payloadChunks.map(async (chunk) => await resend.batch.send(chunk)));
  } catch (error) {
    logger.error(error, { description: 'Error notifying users for upcoming subscription renewal' });
  }
};

const getEmailBodyTemplate = (options: {
  paymentTokenSymbol: string;
  productDescription: string;
  recipientAddress: string;
  planTokenSymbol: string;
  paymentChain: string;
  productName: string;
  type: ProductType;
  amount: string;
  email: string;
}) => {
  if (options.type === 'SUBSCRIPTION') {
    return `
Hello ${options.email},

This is a friendly reminder that your subscription to ${options.productName} is due for renewal sometime tomorrow.

Subscription: ${options.productName}
Renewal Amount: ${options.amount} ${options.planTokenSymbol}
Payment Info: Paid in ${options.paymentTokenSymbol} on ${options.paymentChain}

To ensure uninterrupted access, please make sure you have sufficient funds in your wallet before the renewal date.

If you have any questions or need assistance, please reach out to our support team.

Thank you for your continued support!

Best regards,
SuperSub Team.
`;
  }

  return `
Hello ${options.email},

This is a friendly reminder that your recurring payment to ${options.recipientAddress} is scheduled for sometime tomorrow.

Payment Description: ${options.productDescription}
Recipient: ${options.recipientAddress}
Amount: ${options.amount} ${options.planTokenSymbol}
Payment Info: Paid in ${options.paymentTokenSymbol}  on ${options.paymentChain}

Please ensure you have sufficient funds in your crypto wallet to avoid any failures in your recurring payment.

If you have any questions or need assistance, please reach out to our support team.

Thank you for your continued support!

Best regards,
SuperSub Team.
`;
};

export const getChargeNotificationBodyTemplate = (options: { chargeStatus: boolean; email: string; url: string }) => {
  return options.chargeStatus
    ? `
Hello ${options.email},;
Your subscription was successfully processed. Click the link below to view your invoice.
  ${options.url}
`
    : `Hello ${options.email},;
Your subscription failed to process. Please check your balance. If you have any questions or need assistance, please reach out to our support team.
`;
};
