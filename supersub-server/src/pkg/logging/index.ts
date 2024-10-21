import winston from 'winston';

import { config } from '~/pkg/env';

winston.addColors({
  warn: 'yellow',
  info: 'green',
  debug: 'cyan',
  error: 'red',
});

export const logger = winston.createLogger({
  format:
    config.ENVIRONMENT === 'development'
      ? winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.prettyPrint(),
          winston.format.cli(),
        )
      : winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp(),
          winston.format.metadata(),
          winston.format.json(),
        ),
  transports: [new winston.transports.Console()],
  level: config.LOG_LEVEL,
});
