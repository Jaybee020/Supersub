import { baseSepolia } from 'viem/chains';
import { Job } from 'bullmq';

import { logger } from '~/pkg/logging';

import { indexSubscriptionPluginEvents } from './handlers/indexSubscriptionPluginEvents';
import { notifyUsersForUpcomingSubscriptionRenewal } from './handlers/emailNotification';
import { handleAlchemyAddressActivityWebhook } from './handlers/addressActivityWebhook';
// import { fetchSmartAccounts } from './handlers/fetchSmartAccounts';
import { renewSubscriptions } from './handlers/renewSubscriptions';
import { enrichERC20Tokens } from './handlers/enrichTokens';

export default async function (job: Job) {
  logger.info(`Starting job...`, { jobName: job.name, jobData: job.data });
  //SUPPORTED CHAINS baseSepolia, sepolia, fraxtalTestnet, arbitrumSepolia, optimismSepolia, polygonAmoy];
  const supportedChains = [baseSepolia];

  if (job.name === 'fetch-smart-accounts') {
    // await fetchSmartAccounts(polygonAmoy, Network.MATIC_AMOY);
  } else if (job.name === 'enrich-tokens') {
    for (const chain of supportedChains) {
      await enrichERC20Tokens(chain);
    }
  } else if (job.name === 'index-subscription-plugin-events') {
    for (const chain of supportedChains) {
      await indexSubscriptionPluginEvents(chain);
    }
  } else if (job.name === 'upcoming-subscriptions-renewal-reminders') {
    await notifyUsersForUpcomingSubscriptionRenewal();
  } else if (job.name === 'renew-subscriptions') {
    for (const chain of supportedChains) {
      await renewSubscriptions(chain);
    }
  } else if (job.name === 'alchemy-address-activity') {
    await handleAlchemyAddressActivityWebhook(job.data.webhook);
  } else {
    logger.warn(`Unrecognized job name. Skipping...`, { jobName: job.name });
  }
}
