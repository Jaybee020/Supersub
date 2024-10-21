import { z } from 'zod';

const zEnv = z.object({
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  ALCHEMY_WEBHOOK_SIGNING_KEY: z.string().min(1),
  DATABASE_URL: z.string().url().min(1),
  PORT: z.coerce.number().default(8080),
  ALCHEMY_AUTH_TOKEN: z.string().min(1),
  PRIVY_APP_SECRET: z.string().min(1),
  ALCHEMY_API_KEY: z.string().min(1),
  REDIS_URL: z.string().url().min(1),
  RESEND_API_KEY: z.string().min(1),
  PRIVY_APP_ID: z.string().min(1),
  PRIVATE_KEY: z.string().min(1),
  SECRET_KEY: z.string().min(1),
});

const parsedEnv = zEnv.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Unable to parse environment variables ${parsedEnv.error}`);
}

export const config = parsedEnv.data;
