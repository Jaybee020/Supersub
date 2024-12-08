/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  payRequestWithSingleRequestForwarder,
  deploySingleRequestForwarder,
  hasSufficientFunds,
  payRequest,
} from '@requestnetwork/payment-processor';
import { RequestNetwork, Request, Types, Utils } from '@requestnetwork/request-client.js';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import { getPaymentReference } from '@requestnetwork/payment-detection';
import { providers, Wallet } from 'ethers';

import { getRPCUrl, config } from '../env';

export class RequestProvider {
  chainName: any;
  requestClient;
  constructor(chainName: any) {
    this.chainName = chainName;
    EthereumPrivateKeySignatureProvider;
    const epkSignatureProvider = new EthereumPrivateKeySignatureProvider({
      method: Types.Signature.METHOD.ECDSA,
      privateKey: config.PRIVATE_KEY, // Must include 0x prefix
    });

    this.requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: 'https://sepolia.gateway.request.network/',
      },
      signatureProvider: epkSignatureProvider,
    });
  }

  async payRequest(request: Request, payer: Wallet) {
    let requestData = await request.waitForConfirmation();
    console.log(`requestData = ${JSON.stringify(requestData)}`);
    const chainProvider = new providers.JsonRpcProvider(getRPCUrl(this.chainName));

    const signer = payer;
    const _hasSufficientFunds = await hasSufficientFunds({
      providerOptions: {
        provider: chainProvider,
      },
      address: signer.address,
      request: requestData,
    });
    if (!_hasSufficientFunds) {
      throw new Error(`Insufficient Funds: ${signer.address}`);
    }

    //check request type
    //     const _hasErc20Approval = await hasErc20Approval(
    //       requestData,
    //       signer.address,
    //       chainProvider
    //     );
    //     console.log(`_hasErc20Approval = ${_hasErc20Approval}`);

    //     if (!_hasErc20Approval) {
    //       console.log(`Requesting approval...`);
    //       const approvalTx = await approveErc20(requestData, signer);
    //       await approvalTx.wait(2);
    //       console.log(`Approval granted. ${approvalTx.hash}`);
    //     }

    const paymentTx = await payRequest(requestData, signer);
    await paymentTx.wait(2);
    console.log(`Payment complete. ${paymentTx.hash}`);

    const startTime = Date.now();
    while (!requestData.balance?.balance || requestData.balance?.balance < requestData.expectedAmount) {
      requestData = await request.refresh();
      console.log(`current balance = ${requestData.balance?.balance}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check if 5 seconds have passed, and if so, break out of the loop
      if (Date.now() - startTime >= 5000) {
        console.log('Timeout: Exiting loop after 5 seconds.');
        break;
      }
    }
  }

  async createERC20PaymentRequest(
    payerAddress: string,
    paymentToken: string,
    paymentRecipient: string,
    totalPaymentAmount: string,
    feePercentage: number,
  ) {
    const payeeIdentity = new Wallet(config.PRIVATE_KEY).address;
    const feeRecipient = config.FEE_RECIPIENT;
    const feeAmount = (BigInt(feePercentage) * BigInt(totalPaymentAmount)) / 100n;

    const request = await this.requestClient.createRequest({
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          network: this.chainName,
          value: paymentToken,
        },
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerAddress,
        },
        expectedAmount: (BigInt(totalPaymentAmount) - BigInt(feeAmount)).toString(),
        timestamp: Utils.getCurrentTimestampInSecond(),
      },
      paymentNetwork: {
        parameters: {
          paymentNetworkName: this.chainName,
          paymentAddress: paymentRecipient,
          feeAmount: feeAmount.toString(),
          feeAddress: feeRecipient,
        },
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
      },

      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity,
      },
    });
    const requestData = await request.waitForConfirmation();

    return { requestData };
  }

  async createNativeTokenPaymentRequest(
    payerAddress: string,
    paymentRecipient: string,
    totalPaymentAmount: string,
    feePercentage: number,
  ) {
    const payeeIdentity = new Wallet(config.PRIVATE_KEY).address;
    const feeRecipient = config.FEE_RECIPIENT;
    const feeAmount = (BigInt(feePercentage) * BigInt(totalPaymentAmount)) / 100n;
    const request = await this.requestClient.createRequest({
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ETH,
          network: this.chainName,
          value: 'ETH',
        },
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerAddress,
        },
        expectedAmount: (BigInt(totalPaymentAmount) - BigInt(feeAmount)).toString(),
      },
      paymentNetwork: {
        parameters: {
          paymentNetworkName: this.chainName,
          paymentAddress: paymentRecipient,
          feeAmount: feeAmount.toString(),
          feeAddress: feeRecipient,
        },
        id: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity,
      },
    });
    const requestData = await request.waitForConfirmation();

    return { requestData };
  }

  async payRequestViaSingleFowarder(request: Request) {
    const requestData = await request.waitForConfirmation();
    const chainProvider = new providers.JsonRpcProvider(getRPCUrl(this.chainName));

    const signer = new Wallet(config.PRIVATE_KEY, chainProvider);
    const forwarderAddress = await deploySingleRequestForwarder(requestData, signer);
    await payRequestWithSingleRequestForwarder(forwarderAddress, signer, requestData.expectedAmount.toString());
  }

  //TODO
  // async createSwapERC20PaymentRequest(
  //   payerAddress: string,
  //   paymentToken: string,
  //   paymentRecipient: string,
  //   paymentAmount: string,
  //   feePercentage: number,
  // ) {}

  async generateRequestPaymentReference(requestData: Types.IRequestDataWithEvents) {
    const paymentReference = getPaymentReference(requestData);
    return `0x${paymentReference}`;
  }
}
