import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '~/pkg/errors';

import { apiKeyAuthenticationMiddleware } from './apiKey';
import { privyAuthenticationMiddleware } from './privy';

export const combinedAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.header('authorization');
  const apiKey = req.header('x-api-key');

  if (!authorizationHeader && !apiKey) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, { message: 'Authentication credentials are missing' }));
  }

  if (authorizationHeader) {
    try {
      return await privyAuthenticationMiddleware(req, res, next);
    } catch (error) {
      // If Privy authentication fails, continue to API key authentication
    }
  }

  if (apiKey) {
    try {
      return await apiKeyAuthenticationMiddleware(req, res, next);
    } catch (error) {
      // If API key authentication fails, return the error
      return next(error);
    }
  }

  return next(new ApiError(StatusCodes.UNAUTHORIZED, { message: 'Invalid authentication credentials provided' }));
};
