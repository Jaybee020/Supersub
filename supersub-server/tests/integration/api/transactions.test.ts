import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import request from 'supertest';
import * as jose from 'jose';

import { application } from '~/app';
import { prisma } from '~/pkg/db';

import {
  createFakeSubscriptions,
  createFakeTransactions,
  createPrivyAccessToken,
  verifyPrivyAccessToken,
  createFakeAccounts,
  createFakeProducts,
  createFakeTokens,
  createFakePlans,
} from '../../utils';

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();

  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUser = vi.fn();
  PrivyClient.prototype.verifyAuthToken = vi.fn();

  return { ...mod, PrivyClient };
});

describe('Transactions', async () => {
  const { privateKey, publicKey } = await jose.generateKeyPair('ES256');

  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.verifyAuthToken.mockImplementation(
      async (token: string) => await verifyPrivyAccessToken({ verificationKey: publicKey, token }),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.account.deleteMany();
  });

  it('GET /transactions should return transactions for authenticated user', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const transactions = await createFakeTransactions(5, accounts);
    const transactionsForAccount0 = transactions.filter(
      (tx) =>
        (tx.sender === accounts[0].smartAccountAddress && tx.type === 'WITHDRAWAL') ||
        (tx.recipient === accounts[0].smartAccountAddress && tx.type === 'DEPOSIT'),
    );

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('transactions');
    expect(response.body.data.transactions).toHaveLength(transactionsForAccount0.length);
  });

  it('GET /transactions should return transactions with offset and limit', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const transactions = await createFakeTransactions(20, accounts);
    const transactionsForAccount0 = transactions.filter(
      (tx) =>
        (tx.sender === accounts[0].smartAccountAddress && tx.type === 'WITHDRAWAL') ||
        (tx.recipient === accounts[0].smartAccountAddress && tx.type === 'DEPOSIT'),
    );

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .get('/api/transactions?offset=0&limit=15')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data).toHaveProperty('transactions');
    expect(response.body.data.transactions).toHaveLength(transactionsForAccount0.length);
  });

  it('GET /transactions should filter transactions by reference', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const transactions = await createFakeTransactions(5, accounts);
    const referenceTx = transactions[0];

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .get(`/api/transactions?reference=${referenceTx?.subscriptionOnchainReference}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data).toHaveProperty('transactions');
    expect(
      response.body.data.transactions.every(
        (tx) => tx.subscriptionOnchainReference === referenceTx?.subscriptionOnchainReference,
      ),
    ).toBe(true);
  });

  it('GET /transactions should filter transactions by product', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const products = await createFakeProducts(5, accounts);
    const plans = await createFakePlans(4, products);
    await createFakeSubscriptions(3, accounts, products, plans);
    const transactions = await createFakeTransactions(5, accounts);
    const productTxs = transactions.filter(
      (tx) => tx.subscription?.productOnchainReference === products[0].onchainReference,
    );

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .get(`/api/transactions?product=${products[0].name}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data).toHaveProperty('transactions');
    expect(response.body.data.transactions).toHaveLength(productTxs.length);
    expect(response.body.data.transactions.every((tx) => tx.subscription.product.name === products[0].name)).toBe(
      true,
    );
  });

  it('GET /transactions should return an empty array when the user has no transactions', async () => {
    const accounts = await createFakeAccounts(1);
    await createFakeTokens();

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.transactions).toHaveLength(0);
  });
});
