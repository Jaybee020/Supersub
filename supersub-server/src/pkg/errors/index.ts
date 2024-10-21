import { type NextFunction, type Response, type Request } from 'express';
import { fromZodError } from 'zod-validation-error';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { errorResponse } from '~/pkg/responses';
import { logger } from '~/pkg/logging';

export class ApiError extends Error {
  readonly status: number;

  constructor(
    status: number = StatusCodes.INTERNAL_SERVER_ERROR,
    options?: {
      message?: string;
    },
  ) {
    super(options?.message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error(err, { description: 'api error' });
    }

    return errorResponse(res, err.message, err.status);
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    logger.error(err, { description: 'database error' });

    return errorResponse(
      res,
      'An unexpected database error occurred. Our team is working to resolve it.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  if (err instanceof ZodError) {
    logger.error(err, { description: 'validation error' });

    const validationErr = fromZodError(err);
    return errorResponse(res, validationErr.message, StatusCodes.UNPROCESSABLE_ENTITY);
  }

  logger.error(err, { description: 'unhandled exception error' });
  return errorResponse(
    res,
    'An unexpected error occurred. We are working to resolve the issue.',
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};
