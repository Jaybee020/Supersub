import express, { type NextFunction, type Application, type Response, type Request } from 'express';
import { TransactionType, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { Network } from 'alchemy-sdk';
import { formatEther } from 'viem';
import helmet from 'helmet';
import cors from 'cors';

import { type SuccessResponse, successResponse } from '~/pkg/responses';
import { alchemyWebhookMiddleware } from '~/middlewares/alchemyWebhook';
import { requestLoggerMiddleware } from '~/middlewares/requestLogger';
import { AlchemyWebhookEvent, generateApiKeyPair } from '~/utils';
import { bullBoardMiddleware } from '~/middlewares/bullBoard';
import { handleError, ApiError } from '~/pkg/errors';
import { getAlchemyClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

import { privyAuthenticationMiddleware } from './middlewares/auth';
import { queue } from './pkg/bullmq';

export const application: Application = express();

application.use(cors());
application.use(helmet());
application.use(express.json());
application.use(requestLoggerMiddleware());
application.use('/ui', bullBoardMiddleware());

application.get('/', async (req: Request, res: Response<SuccessResponse>) => {
  return successResponse(res, { ping: 'pong' }, StatusCodes.OK);
});

application.get('/api/balances', async (req: Request, res: Response<SuccessResponse>, next: NextFunction) => {
  const address = req.query.address as string;
  const network = req.query.network as Network;
  const alchemyClient = getAlchemyClient(network);

  try {
    const nativeBalance = await alchemyClient.core.getBalance(address);
    const tokenBalances = await alchemyClient.core.getTokensForOwner(address);
    return successResponse(
      res,
      { nativeBalance: formatEther(nativeBalance.toBigInt()), tokenBalances },
      StatusCodes.OK,
    );
  } catch (e) {
    next(e);
    return;
  }
});

application.get(
  '/api/api-keys',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>, next: NextFunction) => {
    const address = req.query.address as string;
    const apiKey = await prisma.apiKey.findFirst({ where: { accountAddress: address } });
    if (!apiKey) {
      next(new ApiError(StatusCodes.NOT_FOUND, { message: 'apiKey does not exist for this user' }));
      return;
    }
    return successResponse(res, { publicKey: apiKey.publicKey, secretKey: apiKey.secretKey }, StatusCodes.OK);
  },
);

application.post(
  '/api/api-keys',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.query.address as string;
    const apiKey = await prisma.apiKey.findFirst({ where: { accountAddress: address } });
    if (apiKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({ data: { error: 'apiKey already exists for this user' } });
    }
    const { secretKey, publicKey } = generateApiKeyPair();
    await prisma.apiKey.create({
      data: {
        account: {
          connect: { smartAccountAddress: address },
        },
        publicKey: publicKey,
        secretKey: secretKey,
      },
    });
    return successResponse(res, { publicKey, secretKey }, StatusCodes.CREATED);
  },
);

application.post(
  '/api/api-keys/reset',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.query.address as string;
    const { secretKey, publicKey } = generateApiKeyPair();
    await prisma.apiKey.upsert({
      create: {
        account: {
          connect: { smartAccountAddress: address },
        },
        publicKey: publicKey,
        secretKey: secretKey,
      },
      update: {
        publicKey: publicKey,
        secretKey: secretKey,
      },
      where: { accountAddress: address },
    });
    return successResponse(res, { publicKey, secretKey }, StatusCodes.OK);
  },
);

application.get('/api/transactions', async (req: Request, res: Response<SuccessResponse>) => {
  const address = req.query.address as string;
  const chainId = Number(req.query.chainId);
  const { offset = '0', limit = '10', reference, product } = req.query;

  const where: Prisma.TransactionWhereInput = {
    OR: [
      {
        AND: [{ sender: address }, { type: TransactionType.WITHDRAWAL }],
      },
      {
        AND: [{ recipient: address }, { type: TransactionType.DEPOSIT }],
      },
    ],
  };

  if (reference) {
    where.subscriptionOnchainReference = reference as string;
  }
  if (product) {
    where.subscription = {
      product: {
        name: product as string,
      },
    };
  }

  where.chainId = chainId;

  const skip = parseInt(offset as string);
  const take = parseInt(limit as string);
  const transactions = await prisma.transaction.findMany({
    include: { subscription: { include: { plan: { include: { token: true } }, product: true } }, token: true },
    orderBy: { id: 'desc' },
    where: where,
    take: take,
    skip: skip,
  });
  return successResponse(
    res,
    {
      transactions,
    },
    StatusCodes.OK,
  );
});

application.get('/api/subscriptions', async (req: Request, res: Response<SuccessResponse>) => {
  const address = req.query.address as string;
  const chainId = Number(req.query.chainId);

  const { isActive } = req.query;

  const where: Prisma.SubscriptionWhereInput = {
    subscriberAddress: address,
    chainId,
  };
  if (isActive) {
    where.isActive = ['true', '1'].includes(isActive.toString().toLowerCase())
      ? true
      : ['false', '0'].includes(isActive.toString().toLowerCase())
        ? false
        : undefined;
  }

  const subscriptions = await prisma.subscription.findMany({
    include: { plan: { include: { token: true } }, paymentToken: true, product: true },
    where: where,
  });

  return successResponse(res, { subscriptions }, StatusCodes.OK);
});

application.get('/api/products', async (req: Request, res: Response<SuccessResponse>) => {
  const address = req.query.address as string;
  const chainId = Number(req.query.chainId);
  const products = await prisma.product.findMany({
    include: { _count: { select: { subscriptions: true } }, plans: { include: { token: true } } },
    where: { creatorAddress: address, chainId },
  });

  return successResponse(res, { products }, StatusCodes.OK);
});

application.get('/api/products/:reference', async (req: Request, res: Response<SuccessResponse>) => {
  const address = req.query.address as string;
  const product = await prisma.product.findUnique({
    include: {
      plans: { include: { token: true }, orderBy: { id: 'asc' } },
      _count: { select: { subscriptions: true } },
    },
    where: { onchainReference: req.params.reference, creatorAddress: address },
  });

  return successResponse(res, { product }, StatusCodes.OK);
});

application.get('/api/plan/:reference', async (req: Request, res: Response<SuccessResponse>) => {
  const plan = await prisma.plan.findUnique({
    where: { onchainReference: req.params.reference },
    include: { product: true, token: true },
  });

  return successResponse(res, { plan }, StatusCodes.OK);
});

application.get('/api/transaction/:reference', async (req: Request, res: Response<SuccessResponse>) => {
  const transaction = await prisma.transaction.findFirst({
    include: { subscription: { include: { plan: { include: { token: true } }, product: true } }, token: true },
    where: { onchainReference: req.params.reference },
  });

  return successResponse(res, { transaction }, StatusCodes.OK);
});

application.put('/api/email/:address', async (req: Request, res: Response<SuccessResponse>) => {
  const smartAccountAddress = req.params.address as string;
  const email = req.body.email as string;
  //check if account with smart Account address exists, if it does, update email, if it doesn't, create account with email
  const account = await prisma.account.findUnique({
    where: { smartAccountAddress: smartAccountAddress },
    select: { emailAddress: true },
  });

  if (account) {
    await prisma.account.update({
      where: { smartAccountAddress: smartAccountAddress },
      data: { emailAddress: email },
    });
  } else {
    await prisma.account.create({
      data: {
        smartAccountAddress: smartAccountAddress,
        emailAddress: email,
      },
    });
  }

  return successResponse(res, { email }, StatusCodes.OK);
});

application.get('/api/email/:address', async (req: Request, res: Response<SuccessResponse>) => {
  const address = req.params.address as string;
  const email = await prisma.account.findUnique({
    where: { smartAccountAddress: address },
    select: { emailAddress: true },
  });
  return successResponse(res, { email: email?.emailAddress }, StatusCodes.OK);
});

application.post('/_webhook', alchemyWebhookMiddleware, async (req: Request, res: Response<SuccessResponse>) => {
  const webhookEvent = req.body as AlchemyWebhookEvent;
  console.log(webhookEvent);
  await queue.add('alchemy-address-activity', { webhook: webhookEvent });

  return successResponse(res, {}, StatusCodes.OK);
});

application.use((_req: Request, _res: Response, next: NextFunction) => {
  next(
    new ApiError(StatusCodes.NOT_FOUND, {
      message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
    }),
  );
});

application.use(handleError);
