import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { polygonAmoy } from 'viem/chains';
import { Network } from 'alchemy-sdk';

import { getMultiOwnerModularAccountAddresses, addAddressesToWebhook } from '~/pkg/evm';
import { generateApiKeyPair } from '~/utils';
import { ApiError } from '~/pkg/errors';
import { privy } from '~/pkg/privy';
import { prisma } from '~/pkg/db';

export const privyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.header('authorization');
  if (!authorizationHeader) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, { message: 'Authorization header is missing' }));
  }

  const [type, accessToken] = authorizationHeader.split(' ');
  if (type !== 'Bearer') {
    return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid authorization header provided' }));
  }

  let verifiedClaims;
  try {
    verifiedClaims = await privy.verifyAuthToken(accessToken);
  } catch (e) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid authorization header provided' }));
  }

  try {
    let account = await prisma.account.findFirst({
      where: {
        metadata: {
          equals: { privyDid: verifiedClaims.userId },
        },
      },
    });
    if (!account) {
      const privyUser = await privy.getUser(verifiedClaims.userId);
      const privyAddress = privyUser.wallet?.address as `0x${string}`;
      const smartAccountAddresses = await getMultiOwnerModularAccountAddresses(polygonAmoy, [privyAddress]);

      await addAddressesToWebhook(Object.values(smartAccountAddresses), Network.MATIC_AMOY);
      account = await prisma.account.create({
        data: {
          smartAccountAddress: smartAccountAddresses[privyAddress],
          emailAddress: privyUser.email?.address as string,
          metadata: { privyDid: privyUser.id },
          eoaAddress: privyAddress,
        },
      });
    }

    try {
      const { secretKey, publicKey } = generateApiKeyPair();
      await prisma.apiKey.upsert({
        create: {
          account: {
            connect: { smartAccountAddress: account.smartAccountAddress },
          },
          publicKey: publicKey,
          secretKey: secretKey,
        },
        where: { accountAddress: account.smartAccountAddress },
        update: {},
      });
    } catch (error) {
      // do nothing
    }

    req.auth = {
      address: account.smartAccountAddress,
      method: 'access-token',
      apiKey: null,
    };

    next();
  } catch (e) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, { message: 'Invalid authorization header provided' }));
  }
};
