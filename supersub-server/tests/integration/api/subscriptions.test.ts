import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import request from 'supertest';
import * as jose from 'jose';

import { application } from '~/app';
import { prisma } from '~/pkg/db';

import {
  createFakeSubscriptions,
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

describe('Subscriptions', async () => {
  const { privateKey, publicKey } = await jose.generateKeyPair('ES256');

  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.verifyAuthToken.mockImplementation(
      async (token: string) => await verifyPrivyAccessToken({ verificationKey: publicKey, token }),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.account.deleteMany();
  });

  it('GET /subscriptions should return all subscriptions for the authenticated user', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const products = await createFakeProducts(2, accounts);
    const plans = await createFakePlans(4, products);
    await createFakeSubscriptions(5, accounts, products, plans);

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('subscriptions');
  });

  it('GET /subscriptions should return only active subscriptions for the authenticated user', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const products = await createFakeProducts(2, accounts);
    const plans = await createFakePlans(4, products);
    const subscriptions = await createFakeSubscriptions(5, accounts, products, plans);
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.isActive && sub.subscriberAddress === accounts[0].smartAccountAddress,
    );

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/subscriptions?isActive=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.subscriptions).toHaveLength(activeSubscriptions.length);
    expect(response.body.data.subscriptions.every((sub) => sub.isActive)).toBe(true);
  });

  it('GET /subscriptions should include product details', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    const products = await createFakeProducts(2, accounts);
    const plans = await createFakePlans(4, products);
    await createFakeSubscriptions(5, accounts, products, plans);

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.subscriptions.every((sub) => sub.product)).toBe(true);
  });
});
