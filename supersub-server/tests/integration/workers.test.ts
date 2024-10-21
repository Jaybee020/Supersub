import { beforeEach, afterEach, describe, expect, assert, it, vi } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrivyClient } from '@privy-io/server-auth';
import { polygonAmoy } from 'viem/chains';
import { faker } from '@faker-js/faker';
import { Network } from 'alchemy-sdk';

import { indexSubscriptionPluginEvents } from '~/workers/handlers/indexSubscriptionPluginEvents';
import { handleAlchemyAddressActivityWebhook } from '~/workers/handlers/addressActivityWebhook';
import { fetchSmartAccounts } from '~/workers/handlers/fetchSmartAccounts';
import { enrichERC20Tokens } from '~/workers/handlers/enrichTokens';
import { getEvmHttpClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

import { createFakeTokens } from '../utils';

describe('enrichERC20Tokens', () => {
  beforeEach(async () => {
    await createFakeTokens();
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should update the decimals of tokens with valid results', async () => {
    const tokensBefore = await prisma.token.findMany();
    expect(tokensBefore).toHaveLength(4);

    await enrichERC20Tokens(polygonAmoy);

    const tokensAfter = await prisma.token.findMany({ select: { decimals: true, address: true, symbol: true } });
    expect(tokensAfter).toHaveLength(4);
    expect(tokensAfter).toContainEqual({
      address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      symbol: 'USDC',
      decimals: 6,
    });
    expect(tokensAfter).toContainEqual({
      address: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      symbol: 'WMATIC',
      decimals: 18,
    });
    expect(tokensAfter).toContainEqual({
      address: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904',
      symbol: 'LINK',
      decimals: 18,
    });
    expect(tokensAfter).toContainEqual({
      address: '0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4',
      symbol: 'CCIP-BnM',
      decimals: 18,
    });
  });
});

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();

  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUsers = vi.fn();

  return { ...mod, PrivyClient };
});

describe('fetchSmartAccounts', () => {
  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.getUsers.mockResolvedValueOnce(
      Promise.resolve([
        {
          wallet: { address: '0x19e4057A38a730be37c4DA690b103267AAE1d75d' },
          email: { address: 'user1@example.com' },
          id: '1',
        },
        {
          wallet: { address: '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9' },
          email: { address: 'user2@example.com' },
          id: '2',
        },
        {
          wallet: { address: '0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d' },
          email: { address: 'user3@example.com' },
          id: '3',
        },
      ]),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should create new accounts for new wallets', async () => {
    await fetchSmartAccounts(polygonAmoy, Network.MATIC_AMOY);

    const createdAccounts = await prisma.account.findMany({
      select: {
        smartAccountAddress: true,
        emailAddress: true,
        eoaAddress: true,
        metadata: true,
      },
    });
    expect(createdAccounts.length).toBeGreaterThanOrEqual(3);
    expect(createdAccounts[0]).toMatchObject({
      smartAccountAddress: '0x564BB9C687BE0Ff8474aD67b9D2c6a1b402A86C7',
      eoaAddress: '0x19e4057A38a730be37c4DA690b103267AAE1d75d',
      emailAddress: 'user1@example.com',
      metadata: { privyDid: '1' },
    });
  });

  it('should not create duplicate accounts for existing wallets', async () => {
    await prisma.account.create({
      data: {
        smartAccountAddress: '0x1234567890abcdef0123456789abcdef',
        emailAddress: 'user1@example.com',
        eoaAddress: '0x1234567890abcdef',
        metadata: { privyDid: '1' },
      },
    });

    await fetchSmartAccounts(polygonAmoy, Network.MATIC_AMOY);

    const createdAccounts = await prisma.account.findMany({
      select: {
        smartAccountAddress: true,
        emailAddress: true,
        eoaAddress: true,
        metadata: true,
      },
    });
    expect(createdAccounts).toHaveLength(3);
    expect(createdAccounts[1]).toMatchObject({
      smartAccountAddress: '0xeA20DB45a5D8FdF65249Eb5d22b0730aB7d2Ba9A',
      eoaAddress: '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9',
      emailAddress: 'user2@example.com',
      metadata: { privyDid: '2' },
    });
  });
});

vi.mock('~/pkg/db', () => {
  const prisma = new PrismaClient();
  prisma.product.create = vi.fn();
  prisma.subscription.create = vi.fn();

  return { prisma };
});

describe('indexSubscriptionPluginEvents', () => {
  beforeEach(async () => {
    const { prisma: originalPrisma } = await vi.importActual<typeof import('~/pkg/db')>('~/pkg/db');

    prisma.product.create.mockImplementation(async (args: { data: Prisma.ProductCreateInput }) => {
      const { data } = args;

      await prisma.account.createMany({
        data: [
          {
            metadata: {
              privyDid: `did:privy:${faker.string.numeric(7)}`,
            },
            smartAccountAddress: data.creator.connect?.smartAccountAddress as string,
            eoaAddress: faker.finance.ethereumAddress(),
            emailAddress: faker.internet.email(),
          },
        ],
        skipDuplicates: true,
      });

      await originalPrisma.product.create({ data });
    });

    prisma.subscription.create.mockImplementation(async (args: { data: Prisma.SubscriptionCreateInput }) => {
      const { data } = args;

      await prisma.account.createMany({
        data: [
          {
            metadata: {
              privyDid: `did:privy:${faker.string.numeric(7)}`,
            },
            smartAccountAddress: data.subscriber.connect?.smartAccountAddress as string,
            eoaAddress: faker.finance.ethereumAddress(),
            emailAddress: faker.internet.email(),
          },
        ],
        skipDuplicates: true,
      });

      await originalPrisma.subscription.create({ data });
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.cache.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should index all events properly', async ({ skip }) => {
    skip();
    await indexSubscriptionPluginEvents(polygonAmoy);

    const client = getEvmHttpClient(polygonAmoy);
    const latestBlock = await client.getBlockNumber();

    const products = await prisma.product.findMany({
      select: {
        destinationChain: true,
        onchainReference: true,
        receivingAddress: true,
        creatorAddress: true,
        tokenAddress: true,
        description: true,
        isActive: true,
        logoUrl: true,
        name: true,
        type: true,
      },
    });
    const plans = await prisma.plan.findMany({
      select: {
        productOnchainReference: true,
        onchainReference: true,
        chargeInterval: true,
        isActive: true,
        price: true,
      },
    });
    const subscriptions = await prisma.subscription.findMany({
      select: {
        productOnchainReference: true,
        planOnchainReference: true,
        subscriptionExpiry: true,
        subscriberAddress: true,
        onchainReference: true,
        lastChargeDate: true,
        creatorAddress: true,
        isActive: true,
      },
    });
    const transactions = await prisma.transaction.findMany({
      select: {
        subscriptionOnchainReference: true,
        onchainReference: true,
        tokenAddress: true,
        narration: true,
        recipient: true,
        amount: true,
        sender: true,
        status: true,
        type: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    });
    const lastQueriedBlockCache = await prisma.cache.findUnique({ where: { key: 'last-queried-block' } });

    expect(products.length).toStrictEqual(4);
    expect(products).toMatchSnapshot();

    expect(plans.length).toStrictEqual(6);
    expect(plans).toMatchSnapshot();

    expect(subscriptions.length).toStrictEqual(4);
    expect(subscriptions).toMatchSnapshot();

    expect(transactions.length).toStrictEqual(8);
    expect(transactions).toMatchSnapshot();

    assert.closeTo(Number(lastQueriedBlockCache?.value as string), Number(latestBlock), 3); // a difference of 3 mined blocks.
  });
});

describe('addressActivityWebhook', () => {
  const webhooks = [
    {
      event: {
        activity: [
          {
            hash: '0x204f7b0d1472a476b3ee5ae0b2aa94858e9585f893e759a47e3e30859b200c65',
            rawContract: { rawValue: '0x38d7ea4c68000', decimals: 18 },
            fromAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            typeTraceAddress: 'DELEGATECALL_0',
            blockNum: '0x76cbef',
            category: 'internal',
            asset: 'MATIC',
            value: 0.001,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T15:40:57.188Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_mznrqzf3ehmafixy',
      type: 'ADDRESS_ACTIVITY',
    },
    {
      event: {
        activity: [
          {
            hash: '0x204f7b0d1472a476b3ee5ae0b2aa94858e9585f893e759a47e3e30859b200c65',
            rawContract: { rawValue: '0x38d7ea4c68000', decimals: 18 },
            fromAddress: '0xdadc3e4fa2cf41bc4ea0ad0e627935a5c2db433d',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            blockNum: '0x76cbef',
            category: 'external',
            asset: 'MATIC',
            value: 0.001,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T15:40:57.214Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_htqfu3b8dvgiuh3p',
      type: 'ADDRESS_ACTIVITY',
    },
    {
      event: {
        activity: [
          {
            log: {
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x00000000000000000000000013ef7f422829c7139ceb4695762ba87e86437e5c',
                '0x000000000000000000000000454082dcfa29f386ef348e13d636748a91567749',
              ],
              transactionHash: '0x7d58cb7bfd22ba1bc7441929c8dcec90d8aa8cbc6af80f24010a55f140006f9d',
              blockHash: '0x3bb25e9014bf5908e6e5d7552ff3ab8ef24f724dffd5c0bb6e902cf847f083bb',
              data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
              address: '0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904',
              blockNumber: '0x76ce0e',
              transactionIndex: '0xa',
              logIndex: '0x17',
              removed: false,
            },
            rawContract: {
              rawValue: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
              address: '0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904',
              decimals: 18,
            },
            hash: '0x7d58cb7bfd22ba1bc7441929c8dcec90d8aa8cbc6af80f24010a55f140006f9d',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            blockNum: '0x76ce0e',
            category: 'token',
            asset: 'LINK',
            value: 1,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T16:00:11.422Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_0mkpjwpvvbcvsqd5',
      type: 'ADDRESS_ACTIVITY',
    },
    {
      event: {
        activity: [
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_2_0_0_1_0',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            rawContract: { rawValue: '0x2386f26fc10000', decimals: 18 },
            fromAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            typeTraceAddress: 'DELEGATECALL_2_0_0_3_0',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0.01,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'STATICCALL_2_0_0_1',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_2_0_0_0_0',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'STATICCALL_2_0_0_0',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_2_0_0_2_0',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            rawContract: { rawValue: '0x2386f26fc10000', decimals: 18 },
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            typeTraceAddress: 'CALL_2_0_0_3',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0.01,
          },
          {
            hash: '0xb4b2ad8939bc015e39929810d1105bbff0716609e8fe246f7cfaf89f3397ed1a',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x454082dcfa29f386ef348e13d636748a91567749',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'STATICCALL_2_0_0_2',
            blockNum: '0x76ce66',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T16:03:19.886Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_1yx0y1sen2hq5xhd',
      type: 'ADDRESS_ACTIVITY',
    },
    {
      event: {
        activity: [
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x37604f45111ab488aec38dbb17f90ef1cc90cc32',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_2_0_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_2_0_0_0_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x37604f45111ab488aec38dbb17f90ef1cc90cc32',
            toAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_2_0_0_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0xce0000007b008f50d762d155002600004cd6c647',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_0_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_2_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
            toAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_2_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'STATICCALL_2_0_0_0_0_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_2_0_0_0_0_0_1',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
            toAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'CALL_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
          {
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x0046000000000151008789797b54fdb500e2a61e',
            rawContract: { rawValue: '0x0', decimals: 18 },
            typeTraceAddress: 'DELEGATECALL_0_0',
            blockNum: '0x76cfbd',
            category: 'internal',
            asset: 'MATIC',
            value: 0,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T16:15:27.284Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_djf8l6ls6kxpefbp',
      type: 'ADDRESS_ACTIVITY',
    },
    {
      event: {
        activity: [
          {
            log: {
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x00000000000000000000000013ef7f422829c7139ceb4695762ba87e86437e5c',
                '0x00000000000000000000000037604f45111ab488aec38dbb17f90ef1cc90cc32',
              ],
              transactionHash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
              blockHash: '0xf05b4d3357830a2ded7221ecbf940ca043112580bf4475560fdd155cd5d93b04',
              data: '0x0000000000000000000000000000000000000000000000000000000000030d40',
              address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
              blockNumber: '0x76cfbd',
              transactionIndex: '0x0',
              logIndex: '0x1',
              removed: false,
            },
            rawContract: {
              rawValue: '0x0000000000000000000000000000000000000000000000000000000000030d40',
              address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
              decimals: 6,
            },
            hash: '0x703f2a5f1e132a216b042d1c8ca09d4659a453848facede29abf927e1cc34ef1',
            fromAddress: '0x13ef7f422829c7139ceb4695762ba87e86437e5c',
            toAddress: '0x37604f45111ab488aec38dbb17f90ef1cc90cc32',
            blockNum: '0x76cfbd',
            category: 'token',
            asset: 'USDC',
            value: 0.2,
          },
        ],
        network: 'MATIC_AMOY',
      },
      createdAt: '2024-06-02T16:15:27.411Z',
      webhookId: 'wh_aehf1f0i7izifbim',
      id: 'whevt_9hhwl52dq00m878x',
      type: 'ADDRESS_ACTIVITY',
    },
  ];

  afterEach(async () => {
    vi.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.cache.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should process webhooks correctly and store corresponding transactions in database', async () => {
    for (const webhook of webhooks) {
      await handleAlchemyAddressActivityWebhook(webhook);
    }

    const transactions = await prisma.transaction.findMany({
      select: {
        subscriptionOnchainReference: true,
        onchainReference: true,
        tokenAddress: true,
        narration: true,
        recipient: true,
        amount: true,
        sender: true,
        status: true,
        type: true,
      },
    });
    expect(transactions.length).toStrictEqual(6);
    expect(transactions).toMatchSnapshot();
  });
});
