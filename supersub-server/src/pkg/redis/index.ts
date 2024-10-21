import IORedis from 'ioredis';

import { config } from '~/pkg/env';

const redis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });

export { redis };
