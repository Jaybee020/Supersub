import morgan from 'morgan';

import { logger } from '~/pkg/logging';
import { config } from '~/pkg/env';

export const requestLoggerMiddleware = () =>
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.debug(message.trim()) },
    skip: () => config.ENVIRONMENT !== 'development',
  });
