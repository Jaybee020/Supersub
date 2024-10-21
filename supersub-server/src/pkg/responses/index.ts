import { getReasonPhrase } from 'http-status-codes';
import { type Response } from 'express';
import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.object({
    message: z.string().min(1).describe('A human readable explanation of what went wrong'),
    code: z.string().min(1).describe('A machine readable error code.'),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorSchema>;

export const SuccessSchema = z.object({
  data: z.record(z.any()).describe('The payload data returned in the successful response.'),
});

export type SuccessResponse = z.infer<typeof SuccessSchema>;

export const errorResponse = (res: Response<ErrorResponse>, message: string, status: number) => {
  return res.status(status).json({ error: { code: getReasonPhrase(status), message } });
};

export const successResponse = (
  res: Response<SuccessResponse>,
  data: Record<string, unknown>,
  status: number,
): Response => {
  return res.status(status).json({ data });
};
