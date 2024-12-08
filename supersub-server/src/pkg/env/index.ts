import { z } from 'zod';

const zEnv = z.object({
  FEE_RECIPIENT: z.string().default('0xF2CF32E55743603C0c0cf4899656268370932695'),
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  FEE_PERCENTAGE: z.number().min(1).max(10).default(5),
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

export const getRPCUrl = (chainName: string) => {
  switch (chainName) {
    case 'sepolia':
      return `https://eth-sepolia.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`;
    case 'mainnet':
      return `https://eth-mainnet.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`;
    case 'polygon':
      return `https://polygon-rpc.com/`;
    case 'mumbai':
      return `https://polygon-mumbai.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`;
    case 'avalanche':
      return `https://api.avax.network/ext/bc/C/rpc`;
    case 'bsc':
      return `https://bsc-dataseed.binance.org/`;
    case 'bsctest':
      return `https://data-seed-prebsc-1-s1.binance.org:8545/`;
    default:
      return `https://eth-sepolia.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`;
  }
};
