import 'dotenv/config';

import { logger } from '~/pkg/logging';
import { config } from '~/pkg/env';

import { application } from './app';
import { prisma } from './pkg/db';

const server = application.listen(config.PORT, async () => {
  console.log('Listening on port', config.PORT || process.env.PORT);
  // await prisma.subscription.deleteMany({});
  // await prisma.plan.deleteMany({});
  // await prisma.transaction.deleteMany({});
  // await prisma.token.deleteMany({});
  // await prisma.cache.deleteMany({});
  // await prisma.apiKey.deleteMany({});
  // await prisma.account.deleteMany({});
  // await prisma.product.deleteMany({});
  logger.debug(`server is running on port ${config.PORT}`);
});

const exitHandler = (): void => {
  server.close(() => {
    logger.info('server closed');
    process.exit(1);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unexpectedErrorHandler = (error: Error | any): void => {
  logger.error(error, { description: 'unexpected error encountered' });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
  logger.warn('sigterm received. closing server...');
  server.close();
});

export { application };
