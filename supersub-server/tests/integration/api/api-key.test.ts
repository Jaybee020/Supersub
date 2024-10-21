import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import request from 'supertest';
import * as jose from 'jose';

import { application } from '~/app';
import { prisma } from '~/pkg/db';

import { verifyPrivyAccessToken, createPrivyAccessToken, createFakeAccounts } from '../../utils';

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();

  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUser = vi.fn();
  PrivyClient.prototype.verifyAuthToken = vi.fn();

  return { ...mod, PrivyClient };
});

describe('API Keys', async () => {
  const { privateKey, publicKey } = await jose.generateKeyPair('ES256');

  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.verifyAuthToken.mockImplementation(
      async (token: string) => await verifyPrivyAccessToken({ verificationKey: publicKey, token }),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.apiKey.deleteMany();
    await prisma.account.deleteMany();
  });

  //   it('GET /api/api-keys', async () => {
  //     const accounts = await createFakeAccounts(1);
  //     const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
  //     const response = await request(application)
  //       .get('/api/api-keys')
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .expect('Content-Type', /json/)
  //       .expect(404);

  //     expect(response.body).toStrictEqual({
  //       error: {
  //         message: 'apiKey does not exist for this user',
  //         code: 'Not Found',
  //       },
  //     });
  //   });

  //   it('POST /api/api-keys', async () => {
  //     const accounts = await createFakeAccounts(1);
  //     const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
  //     const response = await request(application)
  //       .post('/api/api-keys')
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .expect('Content-Type', /json/)
  //       .expect(201);

  //     expect(response.body).toHaveProperty('data');
  //     expect(response.body.data).toHaveProperty('publicKey');
  //     expect(response.body.data).toHaveProperty('secretKey');
  //   });

  it('GET /api/api-keys/reset', async () => {
    const response = await request(application).get('/api/api-keys/reset').expect('Content-Type', /json/).expect(404);
    expect(response.body).toStrictEqual({
      error: {
        message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
        code: 'Not Found',
      },
    });
  });

  it('POST /api/api-keys/reset', async () => {
    const accounts = await createFakeAccounts(1);
    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .post('/api/api-keys/reset')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('publicKey');
    expect(response.body.data).toHaveProperty('secretKey');
  });
});
