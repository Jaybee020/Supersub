import { PrismaClient } from '@prisma/client';

import { config } from '~/pkg/env';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma = global.prisma || new PrismaClient();

if (config.ENVIRONMENT === 'development') global.prisma = prisma;

export { prisma };
