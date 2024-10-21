import 'dotenv/config';

import { logger } from '~/pkg/logging';
import { config } from '~/pkg/env';

import { application } from './app';

const server = application.listen(config.PORT, () => {
  console.log('Listening on port', config.PORT || process.env.PORT);
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
