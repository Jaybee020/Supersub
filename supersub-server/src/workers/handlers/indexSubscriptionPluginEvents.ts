import { type Chain } from 'viem/chains';
import { type Log } from 'viem';
import dayjs from 'dayjs';

import {
  solidityTimestampToDateTime,
  SubscriptionPluginAbi,
  getEvmHttpClient,
  bytes32ToText,
  CHUNK_SIZE,
} from '~/pkg/evm';
import { getDeploymentVarsByChain } from '~/pkg/evm/constants';
import { logger } from '~/pkg/logging';
import { getRanges } from '~/utils';
import { prisma } from '~/pkg/db';

export const indexSubscriptionPluginEvents = async (chain: Chain) => {
  try {
    logger.info('Indexing subscription plugin events');
    // console.log(chain.name, alchemyNetwork);

    // await fetchSmartAccounts(chain, alchemyNetwork);
    if (!getDeploymentVarsByChain(chain.id)) {
      return;
    }
    const client = getEvmHttpClient(chain);
    const lastQueriedBlockCache = await prisma.cache.upsert({
      create: {
        value: getDeploymentVarsByChain(chain.id).initBlock.toString(),
        key: `last-queried-block-${chain.name}`,
      },
      where: {
        key: `last-queried-block-${chain.name}`,
      },
      update: {},
    });

    const lastQueriedBlock = BigInt(lastQueriedBlockCache.value);
    const latestBlock = await client.getBlockNumber();

    logger.info('Last queried block', { lastQueriedBlock: lastQueriedBlock.toString() });
    logger.info('Latest block', { latestBlock: latestBlock.toString() });

    const ranges: [bigint, bigint][] = getRanges(Number(lastQueriedBlock), Number(latestBlock), CHUNK_SIZE);
    logger.info('Processing event ranges', { numRanges: ranges.length });

    const eventPromises = await Promise.allSettled(
      ranges.map(
        async ([start, end]) =>
          await client.getContractEvents({
            address: getDeploymentVarsByChain(chain.id).subscriptionPlugin as `0x${string}`,
            abi: SubscriptionPluginAbi,
            fromBlock: start,
            toBlock: end,
          }),
      ),
    );
    const events = eventPromises.map((entry) => (entry.status === 'fulfilled' ? entry.value : [])).flat();
    console.log(events.length, events, getDeploymentVarsByChain(chain.id));
    logger.info('Total events', { numEvents: events.length });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventHandlers: Record<string, (event: any, chain: Chain) => Promise<void>> = {
      UserSubscriptionChanged: handleUserSubscriptionChanged,
      SubscriptionCharged: handleSubscriptionCharged,
      PlanUnsubscribed: handlePlanUnSubscribed,
      ProductCreated: handleProductCreated,
      ProductUpdated: handleProductUpdated,
      PlanSubscribed: handlePlanSubscribed,
      PlanCreated: handlePlanCreated,
      PlanUpdated: handlePlanUpdated,
    };

    for (const event of events) {
      const handler = eventHandlers[event.eventName];
      if (handler) {
        try {
          logger.info(`Handling event: ${event.eventName}`, { event });
          await handler(event, chain);
        } catch (error) {
          console.log(error);
          logger.error(`Error handling event ${event.eventName}`, { error, event });
        }
      } else {
        logger.warn(`No handler found for event: ${event.eventName}`);
      }
    }

    await prisma.cache.update({
      where: {
        key: `last-queried-block-${chain.name}`,
      },
      data: {
        value: latestBlock.toString(),
      },
    });
  } catch (error) {
    //@ts-expect-error Error type
    logger.error(error, { description: 'Error indexing subscription plugin events' });
  }
};

const handleProductCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductCreated'>,
  chain: Chain,
) => {
  await prisma.product.create({
    data: {
      type: event.args.productType === 0 ? 'RECURRING' : 'SUBSCRIPTION',
      onchainReference: `${chain.id}:${event.args.productId}`,
      name: bytes32ToText(event.args.name),
      description: event.args.description,
      creatorAddress: event.args.provider,
      logoUrl: event.args.logoURL,
      chainId: chain.id,
      isActive: true,
    },
  });
};

const handleProductUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductUpdated'>,
  chain: Chain,
) => {
  await prisma.product.update({
    where: { onchainReference: `${chain.id}:${event.args.productId}` },
    data: {
      isActive: event.args.isActive,
    },
  });
};

const handlePlanCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanCreated'>,
  chain: Chain,
) => {
  await prisma.plan.create({
    data: {
      token: {
        connectOrCreate: {
          create: {
            onchainReference: `${chain.id}:${event.args.tokenAddress}`,
            address: event.args.tokenAddress,
            chainId: chain.id,
          },
          where: {
            onchainReference: `${chain.id}:${event.args.tokenAddress}`,
            chainId: chain.id,
          },
        },
      },
      product: {
        connect: { onchainReference: `${chain.id}:${event.args.productId}` },
      },
      destinationChain: Number(event.args.destinationChain),
      onchainReference: `${chain.id}:${event.args.planId}`,
      chargeInterval: Number(event.args.chargeInterval),
      receivingAddress: event.args.receivingAddress,
      tokenAddress: event.args.tokenAddress,
      price: event.args.price.toString(),
      chainId: chain.id,
      isActive: true,
    },
  });
};

const handlePlanUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanUpdated'>,
  chain: Chain,
) => {
  await prisma.plan.update({
    data: {
      destinationChain: Number(event.args.destinationChain),
      receivingAddress: event.args.receivingAddress,
      isActive: event.args.isActive,
    },
    where: { onchainReference: `${chain.id}:${event.args.planId}` },
  });
};

// const handleSubscriptionPlanChanged = async (
//   event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionPlanChanged'>,
// ) => {
//   await prisma.subscription.update({
//     data: { plan: { connect: { onchainReference: Number(event.args.planId) } } },
//     where: { onchainReference: Number(event.args.subscriptionId) },
//   });
// };

const handlePlanSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanSubscribed'>,
  chain: Chain,
) => {
  const futureDate = dayjs.unix(16754083200); // 01/12/2500
  const plan = await prisma.plan.findUnique({
    where: {
      onchainReference: `${chain.id}:${event.args.planId}`,
    },
    include: {
      product: true,
    },
  });
  await prisma.subscription.create({
    data: {
      paymentToken: {
        connectOrCreate: {
          create: {
            onchainReference: `${chain.id}:${event.args.paymentToken}`,
            address: event.args.paymentToken,
            chainId: chain.id,
          },
          where: {
            onchainReference: `${chain.id}:${event.args.paymentToken}`,
          },
        },
      },
      subscriptionExpiry:
        event.args.endTime === 0n ? futureDate.toDate() : solidityTimestampToDateTime(event.args.endTime),
      onchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}`,
      product: { connect: { onchainReference: plan?.product.onchainReference } },
      plan: { connect: { onchainReference: plan?.onchainReference } },
      creatorAddress: plan?.product.creatorAddress || '',
      paymentTokenAddress: event.args.paymentToken,
      beneficiaryAddress: event.args.beneficiary,
      subscriberAddress: event.args.subscriber,
      chainId: chain.id,
      isActive: true,
    },
  });
};

const handlePlanUnSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanUnsubscribed'>,
  chain: Chain,
) => {
  await prisma.subscription.update({
    where: {
      onchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}`,
    },
    data: {
      isActive: false,
    },
  });
};

const handleUserSubscriptionChanged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'UserSubscriptionChanged'>,
  chain: Chain,
) => {
  await prisma.subscription.update({
    data: {
      paymentTokenOnchainReference: `${chain.id}:${event.args.paymentToken}`,
      subscriptionExpiry: solidityTimestampToDateTime(event.args.endTime),
      paymentTokenAddress: event.args.paymentToken,
    },
    where: {
      onchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}`,
    },
  });
};

const handleSubscriptionCharged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionCharged'>,
  chain: Chain,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { onchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}` },
    include: { paymentToken: true, product: true, plan: true },
  });

  await prisma.transaction.createMany({
    data: [
      {
        narration:
          subscription?.product.type === 'SUBSCRIPTION'
            ? 'Subscription fee charged'
            : `Recurring payment made to ${subscription?.plan.receivingAddress}`,
        recipient:
          subscription?.product.type === 'SUBSCRIPTION'
            ? subscription?.creatorAddress
            : subscription?.plan.receivingAddress,
        subscriptionOnchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}`,
        tokenOnchainReference: `${chain.id}:${event.args.paymentToken}`,
        onchainReference: `${chain.id}:${event.transactionHash}`,
        amount: event.args.paymentAmount.toString(),
        sender: subscription?.subscriberAddress,
        tokenAddress: event.args.paymentToken,
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
        chainId: chain.id,
      },
      {
        narration:
          subscription?.product.type === 'SUBSCRIPTION'
            ? 'Subscription fee received'
            : `Recurring payment received from ${event.args.beneficiary}`,
        recipient:
          subscription?.product.type === 'SUBSCRIPTION'
            ? subscription?.creatorAddress
            : subscription?.plan.receivingAddress,
        subscriptionOnchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}`,
        tokenOnchainReference: subscription?.plan.tokenOnchainReference as string,
        onchainReference: `${chain.id}:${event.transactionHash}`,
        tokenAddress: subscription?.plan.tokenAddress as string,
        amount: subscription?.plan.price.toString() || '',
        sender: subscription?.subscriberAddress,
        status: 'SUCCESS',
        chainId: chain.id,
        type: 'DEPOSIT',
      },
    ],
  });

  await prisma.subscription.update({
    where: { onchainReference: `${chain.id}:${event.args.planId}:${event.args.beneficiary}` },
    data: { lastChargeDate: solidityTimestampToDateTime(event.args.timestamp) },
  });
};
