import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '~/pkg/errors';
import { prisma } from '~/pkg/db';

export const apiKeyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, { message: 'API key is missing' }));
  }

  const isValid = apiKey.startsWith('sk_') || apiKey.startsWith('pk_');
  if (!isValid) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid API key provided' }));
  }

  try {
    const apiKeyInDb = await prisma.apiKey.findFirst({
      where: { OR: [{ secretKey: apiKey }, { publicKey: apiKey }] },
      include: { account: true },
    });
    if (!apiKeyInDb) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid API key provided' }));
    }

    req.auth = {
      apiKey: apiKey.startsWith('pk_') ? 'public' : apiKey.startsWith('sk_') ? 'secret' : null,
      address: apiKeyInDb.account.smartAccountAddress,
      method: 'api-key',
    };

    return next();
  } catch {
    return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid API key provided' }));
  }
};
