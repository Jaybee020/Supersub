import {
  Address,
  UserOperationCallData,
  BatchUserOperationCallData,
  SmartAccountClient,
} from "@aa-sdk/core";
import {
  accountLoupeActions,
  pluginManagerActions,
} from "@account-kit/smart-contracts";
import {
  ethers,
  Contract,
  Interface,
  Networkish,
  ZeroAddress,
  AlchemyProvider,
} from "ethers";
import { SubscriptionTokenBridge } from "./typechain-types";
import { Subscription } from "./subscription";
import { defaultChain } from "utils/wagmi";

interface Plan {
  price: number;
  chargeInterval: number;
  tokenAddress: string;
  receivingAddress: string;
  destinationChain: number;
}

interface Product {
  name: string;
  description: string;
  logoURL: string;
}

function getWrappedEtherByChain(chainId: number) {
  switch (chainId) {
    case 84532:
      return "0x4200000000000000000000000000000000000006";
    default:
      return "0x4200000000000000000000000000000000000006";
  }
}

class PluginClient {
  // signer: Wallet;
  chain: Networkish;
  pluginAddress: Address;
  bridgeContract: SubscriptionTokenBridge;
  smartAccountClient: SmartAccountClient;
  subscriptionManagerPlugin: Subscription;

  constructor(
    chain: Networkish,
    pluginAddr: Address,
    pluginAbi: ethers.Interface | ethers.InterfaceAbi,
    bridgeAddr: Address,
    bridgeAbi: ethers.Interface | ethers.InterfaceAbi,
    client: SmartAccountClient,
    provider: AlchemyProvider
    // signer: Wallet
  ) {
    this.chain = chain;
    // this.signer = signer;
    this.pluginAddress = pluginAddr;
    this.subscriptionManagerPlugin = new Subscription(chain, pluginAddr);

    this.bridgeContract = new Contract(
      bridgeAddr,
      bridgeAbi,
      provider
    ) as unknown as SubscriptionTokenBridge;
    this.smartAccountClient = client;
  }

  formatPrice(price: number, decimals: number) {
    return BigInt(price) * BigInt(10) ** BigInt(decimals);
  }

  async getInstalledPluginsForSmartAccount() {
    const accountLoupeActionsExtendedClient =
      this.smartAccountClient.extend(accountLoupeActions);
    //@ts-ignore
    return await accountLoupeActionsExtendedClient.getInstalledPlugins({});
  }

  async isPluginInstalled() {
    const accountLoupeActionsExtendedClient =
      this.smartAccountClient.extend(accountLoupeActions);
    const installedPlugins =
      //@ts-ignore
      await accountLoupeActionsExtendedClient.getInstalledPlugins({});

    console.log(installedPlugins);
    if (
      installedPlugins
        .map((addr) => addr.toLowerCase())
        .includes(this.pluginAddress.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  async installPlugin() {
    const pluginependency =
      await this.subscriptionManagerPlugin.getDependency();
    const accountLoupeActionsExtendedClient =
      this.smartAccountClient.extend(pluginManagerActions);
    //@ts-ignore
    await accountLoupeActionsExtendedClient.installPlugin({
      pluginAddress: this.pluginAddress,
      dependencies: pluginependency,
    });
  }

  async uninstallPlugin(addr: Address) {
    const accountLoupeActionsExtendedClient =
      this.smartAccountClient.extend(pluginManagerActions);
    //@ts-ignore
    await accountLoupeActionsExtendedClient.uninstallPlugin({
      pluginAddress: this.pluginAddress,
    });
  }

  async execute(
    param: string | UserOperationCallData | BatchUserOperationCallData
  ) {
    const userOp = await this.smartAccountClient.sendUserOperation({
      //@ts-ignore
      uo: param,
    });
    const hash = await this.smartAccountClient.waitForUserOperationTransaction({
      hash: userOp.hash,
    });
    return hash;
  }

  async createProduct(
    name: string,
    description: string,
    logoURL: string,
    productType: 0 | 1,
    initPlans?: Plan[]
  ) {
    const isPluginInstalled = await this.isPluginInstalled();
    console.log("Subscription Plugin installation status: ", isPluginInstalled);
    if (!isPluginInstalled) {
      await this.installPlugin();
      console.log("Installed subscription Plugin");
    }
    const productParams =
      this.subscriptionManagerPlugin.encodeCreateProductParams(
        name,
        description,
        logoURL,
        productType,
        initPlans
      ) as `0x${string}`;
    const hash = await this.execute(productParams);
    console.log(hash, "product Creation txn gone");
    return hash;
  }

  async updateProduct(productId: number, isActive: boolean) {
    if (!(await this.isPluginInstalled())) {
      await this.installPlugin();
    }

    const updateParams =
      this.subscriptionManagerPlugin.encodeUpdateProductParams(
        productId,
        isActive
      );
    const hash = await this.execute(updateParams);
    console.log(`Update Product Txn Hash: ${hash}`);
    return hash;
  }

  async createPlan(
    productId: number,
    price: number,
    chargeInterval: number,
    planPaymentToken: string,
    receivingAddress: string,
    destinationChain: number
  ) {
    const createPlanParams =
      this.subscriptionManagerPlugin.encodeCreateSubscriptionPlanParams(
        productId,
        price,
        chargeInterval,
        planPaymentToken,
        receivingAddress,
        destinationChain
      );
    const hash = await this.execute(createPlanParams);
    console.log(`Create Plan Txn Hash: ${hash}`);
    return hash;
  }

  async updatePlan(
    planId: number,
    receivingAddress: string,
    destinationChain: number,
    isActive: boolean
  ) {
    const updatePlanParams =
      this.subscriptionManagerPlugin.encodeUpdateSubscriptionPlanParams(
        planId,
        receivingAddress,
        destinationChain,
        isActive
      );
    const hash = await this.execute(updatePlanParams);
    console.log(`Update Plan Txn Hash: ${hash}`);
    return hash;
  }

  // async createProductWithPlans(
  //   name: string,
  //   description: string,
  //   logoUrl: string,
  //   chargeToken: Address,
  //   recipient: Address,
  //   destinationChain: number,
  //   plans: Plan[]
  // ) {
  //   if (!(await this.isPluginInstalled())) {
  //     await this.installPlugin();
  //   }

  //   const param = this.pluginContract.interface.encodeFunctionData(
  //     "createProductWithPlans",
  //     [
  //       ethers.encodeBytes32String(name),
  //       description,
  //       logoUrl,
  //       1,
  //       chargeToken,
  //       recipient,
  //       destinationChain,
  //       plans.map((plan) => {
  //         return {
  //           price: plan.price,
  //           chargeInterval: plan.chargeInterval,
  //         };
  //       }),
  //     ]
  //   );

  //   console.log(param);
  //   const hash = await this.execute(param);
  //   console.log(`Create Product With Plans Txn Hash: ${hash}`);
  //   return hash;
  // }

  async createRecurringPayment(
    initPlans: Plan,
    endTime: number,
    paymentToken?: string,
    paymentTokenSwapFee: number = 0,
    description?: string
  ) {
    if (!paymentToken) {
      paymentToken = initPlans.tokenAddress;
    }
    if (paymentToken != initPlans.tokenAddress) {
      let tokenB = initPlans.tokenAddress;
      let tokenA = paymentToken;
      if (paymentToken == ZeroAddress) {
        tokenA = getWrappedEtherByChain(defaultChain.id); //change to WETH by chain
      }
      if (initPlans.tokenAddress == ZeroAddress) {
        tokenB = getWrappedEtherByChain(defaultChain.id);
      }
      const factory =
        await this.subscriptionManagerPlugin.contract.swapFactory();
      paymentTokenSwapFee =
        (
          await this.subscriptionManagerPlugin.getV3PairAddress(
            factory,
            tokenA,
            tokenB
          )
        ).fee || 0;
      console.log("factory", factory, paymentToken, paymentTokenSwapFee);
    }

    const accountAddr = await this.smartAccountClient.account?.address;
    if (!accountAddr) {
      throw new Error("Account not found");
    }
    const recurringProductId =
      await this.subscriptionManagerPlugin.getProductForRecurringPayment(
        accountAddr
      );
    if (!description) {
      description = `A recurring payment to ${initPlans.receivingAddress}`;
    }
    const recurringPaymentParams =
      this.subscriptionManagerPlugin.encodeCreateRecurringPaymentParams(
        recurringProductId,
        initPlans,
        { endTime, paymentToken, paymentTokenSwapFee, description }
      ) as `0x${string}`;
    const isPluginInstalled = await this.isPluginInstalled();
    if (!isPluginInstalled) {
      await this.installPlugin();
      console.log("Installed subscription Plugin");
    }
    console.log(initPlans, recurringProductId);

    const hash = await this.execute(recurringPaymentParams);
    console.log(hash, "create Recurring txn gone");
    return hash;
  }

  async subscribe(
    planId: number,
    endTime: number,
    paymentToken?: string,
    beneficiary?: string,
    paymentTokenSwapFee: number = 0
  ) {
    const subscriptionPlan =
      await this.subscriptionManagerPlugin.getSubscriptionPlanById(planId);

    const isPluginInstalled = await this.isPluginInstalled();
    console.log("Subscription Plugin installation status: ", isPluginInstalled);
    if (!isPluginInstalled) {
      await this.installPlugin();
      console.log("Installed subscription Plugin");
    }
    if (!beneficiary) {
      beneficiary = this.smartAccountClient.account?.address;
    }
    if (!paymentToken) {
      paymentToken = subscriptionPlan[5];
    } else {
      if (paymentToken != subscriptionPlan[5]) {
        const factory =
          await this.subscriptionManagerPlugin.contract.swapFactory();
        paymentTokenSwapFee =
          (
            await this.subscriptionManagerPlugin.getV3PairAddress(
              factory,
              subscriptionPlan[5],
              paymentToken
            )
          ).fee || 0;
      }
    }

    if (!beneficiary) {
      throw new Error("Beneficiary address not found");
    }

    const subscribeParams =
      this.subscriptionManagerPlugin.encodeSubscribeFunctionParamas(
        planId,
        endTime,
        paymentToken!,
        beneficiary,
        paymentTokenSwapFee
      ) as any;

    console.log("subscribe params", subscribeParams);
    const hash = await this.execute(subscribeParams);
    console.log(`Subscribe Txn Hash: ${hash}`);
    return hash;
  }

  async unSubscribe(planId: number) {
    const unsubscribeParams =
      this.subscriptionManagerPlugin.encodeUnsubscribeFunctionParamas(
        planId
      ) as any;
    const isPluginInstalled = await this.isPluginInstalled();
    if (isPluginInstalled) {
      const hash = await this.execute(unsubscribeParams);
      console.log(`Unsubscribe Txn Hash: ${hash}`);
      return hash;
    }
  }

  async changeSubscriptionPlanPaymentInfo(
    planId: number,
    endTime?: number,
    paymentToken?: string,
    beneficiary?: string,
    paymentTokenSwapFee: number = 0
  ) {
    const smartAccountAddress = this.smartAccountClient.account?.address;
    if (!beneficiary) {
      beneficiary = smartAccountAddress;
    }

    if (!beneficiary) {
      throw new Error("Beneficiary address not found");
    }
    const subscription =
      await this.subscriptionManagerPlugin.getUserSubscriptionByPlanId(
        beneficiary,
        planId
      );
    if (!paymentToken) {
      paymentToken = subscription[3];
    }
    if (!endTime) {
      endTime = Number(subscription[2]);
    }
    const subscribeParams =
      this.subscriptionManagerPlugin.encodeUpdateUserSubscriptionParams(
        planId,
        endTime,
        paymentToken!,
        beneficiary,
        paymentTokenSwapFee
      ) as any;
    const isPluginInstalled = await this.isPluginInstalled();
    console.log("Subscription Plugin installation status: ", isPluginInstalled);
    if (!isPluginInstalled) {
      await this.installPlugin();
      console.log("Installed subscription Plugin");
    }
    console.log("subscribe params", subscribeParams);
    const hash = await this.execute(subscribeParams);
    console.log(`Change subscription endtime Txn Hash: ${hash}`);
    return hash;
  }

  async sendToken(tokenAddr: string, recipient: string, value: bigint) {
    var userOp: UserOperationCallData;
    if (tokenAddr == ZeroAddress) {
      userOp = {
        target: recipient as `0x${string}`,
        value: value,
        data: "0x",
      };
    } else {
      const erc20Abi = [
        "function transfer(address to, uint256 value) public returns (bool)",
      ];

      // Create an instance of the Interface
      const callData = new Interface(erc20Abi).encodeFunctionData("transfer", [
        recipient,
        value,
      ]);
      userOp = {
        target: tokenAddr as `0x${string}`,
        data: callData as `0x${string}`,
      };
    }
    const hash = await this.execute(userOp);
    console.log(`Change sendToken  Txn Hash: ${hash}`);
    return hash;
  }

  async bridgeAsset(
    chainSelector: bigint,
    recipient: string,
    token: string,
    value: number
  ) {
    //do token approval and execute with batch instead
    const erc20Abi = [
      "function transfer(address to, uint256 value) public returns (bool)",
    ];
    const approveCallData = new Interface(erc20Abi).encodeFunctionData(
      "approve",
      [recipient, value]
    );
    const callData = this.bridgeContract.interface.encodeFunctionData(
      "transferToken",
      [chainSelector, recipient, token, value, 0, 0]
    );
    const bridgeContractAddr = await this.bridgeContract.getAddress();
    const userOp = [
      {
        target: bridgeContractAddr as `0x${string}`,
        data: approveCallData as `0x${string}`,
      },
      {
        target: bridgeContractAddr as `0x${string}`,
        data: callData as `0x${string}`,
      },
    ];
    const hash = await this.execute(userOp);
    console.log(`Change bridge Asset  Txn Hash: ${hash}`);
    return hash;
  }
}

export default PluginClient;
