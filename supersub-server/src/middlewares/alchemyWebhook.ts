import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as crypto from 'crypto';

import { ApiError } from '~/pkg/errors';
import { config } from '~/pkg/env';

export const alchemyWebhookMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const hmac = crypto.createHmac('sha256', config.ALCHEMY_WEBHOOK_SIGNING_KEY);
  hmac.update(JSON.stringify(req.body));

  if (req.header('x-alchemy-signature') !== hmac.digest('hex')) {
    next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid payload provided' }));
  }

  next();
};
