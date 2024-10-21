import { TransactionStatus, TransactionType, ProductType, Account, Product, Plan } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as jose from 'jose';

import { prisma } from '~/pkg/db';

export const TEST_TOKENS = [
  '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC
  '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9', // WMATIC
  '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904', // LINK
  '0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4', // CCIP BnM
];

export const createFakeAccounts = async (n: number) => {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    payloads.push({
      metadata: {
        privyDid: `did:privy:${faker.string.numeric(7)}`,
      },
      smartAccountAddress: faker.finance.ethereumAddress(),
      eoaAddress: faker.finance.ethereumAddress(),
      emailAddress: faker.internet.email(),
    });
  }

  return await prisma.account.createManyAndReturn({ skipDuplicates: true, data: payloads });
};

export const createFakeProducts = async (n: number, accounts: Account[]) => {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    payloads.push({
      creatorAddress: faker.helpers.arrayElement(accounts).smartAccountAddress,
      type: faker.helpers.arrayElement(Object.values(ProductType)),
      description: faker.commerce.productDescription(),
      onchainReference: faker.string.alphanumeric(),
      name: faker.commerce.productName(),
      logoUrl: faker.image.url(),
      chainId: 5,
    });
  }

  return await prisma.product.createManyAndReturn({ skipDuplicates: true, data: payloads });
};

export const createFakePlans = async (n: number, products: Product[]) => {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    payloads.push({
      productOnchainReference: faker.helpers.arrayElement(products).onchainReference,
      tokenOnchainReference: faker.helpers.arrayElement(TEST_TOKENS),
      destinationChain: faker.number.int({ max: 100_000, min: 1 }),
      tokenAddress: faker.helpers.arrayElement(TEST_TOKENS),
      chargeInterval: faker.number.int({ max: 12, min: 1 }),
      receivingAddress: faker.finance.ethereumAddress(),
      onchainReference: faker.string.alphanumeric(),
      price: faker.finance.amount(),
      chainId: 5,
    });
  }

  return await prisma.plan.createManyAndReturn({ skipDuplicates: true, data: payloads });
};

export const createFakeSubscriptions = async (n: number, accounts: Account[], products: Product[], plans: Plan[]) => {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    payloads.push({
      productOnchainReference: faker.helpers.arrayElement(products).onchainReference,
      subscriberAddress: faker.helpers.arrayElement(accounts).smartAccountAddress,
      creatorAddress: faker.helpers.arrayElement(accounts).smartAccountAddress,
      planOnchainReference: faker.helpers.arrayElement(plans).onchainReference,
      paymentTokenOnchainReference: faker.finance.ethereumAddress(),
      paymentTokenAddress: faker.finance.ethereumAddress(),
      beneficiaryAddress: faker.finance.ethereumAddress(),
      onchainReference: faker.string.alphanumeric(),
      subscriptionExpiry: faker.date.soon(),
      lastChargeDate: faker.date.recent(),
      chainId: 5,
    });
  }

  return await prisma.subscription.createManyAndReturn({ skipDuplicates: true, data: payloads });
};

export const createFakeTokens = async () => {
  return await prisma.token.createManyAndReturn({
    data: TEST_TOKENS.map((token) => ({ onchainReference: `5${token}`, address: token, chainId: 5 })),
    skipDuplicates: true,
  });
};

export const createFakeTransactions = async (n: number, accounts: Account[]) => {
  const payloads = [];
  for (let i = 0; i < n; i++) {
    const [sender, recipient] = faker.helpers.uniqueArray(accounts, 2);
    payloads.push({
      status: faker.helpers.arrayElement(Object.values(TransactionStatus)),
      type: faker.helpers.arrayElement(Object.values(TransactionType)),
      tokenOnchainReference: faker.helpers.arrayElement(TEST_TOKENS),
      onchainReference: faker.string.hexadecimal({ length: 64 }),
      narration: faker.finance.transactionDescription(),
      tokenAddress: faker.finance.ethereumAddress(),
      recipient: recipient.smartAccountAddress,
      sender: sender.smartAccountAddress,
      amount: faker.finance.amount(),
      chainId: 5,
    });
  }

  return await prisma.transaction.createManyAndReturn({ skipDuplicates: true, data: payloads });
};

export const createPrivyAccessToken = async (opts: { privateKey: jose.KeyLike; privyDid: string }) =>
  await new jose.SignJWT({ sid: faker.string.uuid() })
    .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
    .setIssuer('privy.io')
    .setIssuedAt()
    .setAudience('privy-app-id')
    .setSubject(opts.privyDid)
    .setExpirationTime('1h')
    .sign(opts.privateKey);

export const verifyPrivyAccessToken = async (opts: { verificationKey: jose.KeyLike; token: string }) => {
  const { payload } = await jose.jwtVerify(opts.token, opts.verificationKey, {
    audience: 'privy-app-id',
    issuer: 'privy.io',
  });

  return {
    expiration: payload.exp,
    sessionId: payload.sid,
    issuedAt: payload.iat,
    issuer: payload.iss,
    userId: payload.sub,
    appId: payload.aud,
  };
};
