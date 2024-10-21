import {
  Contract,
  getDefaultProvider,
  Networkish,
  Provider,
  ZeroAddress,
} from "ethers";
import { abi } from "./abis/ProductSubscriptionManagerPlugin.json";

type Address = string;

function filterArrayInRange(
  array: number[],
  minValue: number,
  maxValue: number
): number[] {
  return array.filter((num) => num >= minValue && num <= maxValue);
}

export class SupersubSDK {
  chain: Networkish;
  address: Address;
  provider: Provider;
  contract: Contract;
  gracePeriod?: number;

  constructor(address?: Address, chain?: Networkish, gracePeriod?: number) {
    this.address = address || ZeroAddress; //deployment Address by default
    this.chain = chain || 84532; //base sepolia by default
    this.provider = getDefaultProvider(this.chain);
    this.contract = new Contract(this.address, abi, this.provider);
    this.gracePeriod = gracePeriod || 259200; //default of 3 days
  }

  async checkAddressSubscribedToPlan(opts: {
    subscriber: string;
    planId: number;
  }) {
    return await this.contract.isActivelySubscribedToPlan(
      opts.planId,
      opts.subscriber,
      this.gracePeriod
    );
  }

  generateSubscribeCheckoutLink(opts: {
    planRef: string;
    beneficiary?: string;
    startDate?: number;
  }) {
    return `https://supersub.app/checkout?planRef=${opts.planRef}&subscriber=${opts.beneficiary}&startDate=${opts.startDate}`;
  }

  async getSubscriptionsByAddress(opts: {
    subscriber: Address;
    minPlanId?: number;
    maxPlanId?: number;
  }) {
    const numOfSubscription = Number(
      await this.contract.numSubscriptionPlans()
    );
    const planIdArray = filterArrayInRange(
      Array.from({ length: numOfSubscription }, (_, i) => i), // Array of numbers
      opts.minPlanId || 0,
      opts.maxPlanId || numOfSubscription - 1
    );

    const subscriptions = await Promise.all(
      planIdArray.map(async (planId) => {
        const data = await this.contract.subscriptionStatuses(
          opts.subscriber,
          planId
        );
        return {
          ...data,
          planId,
        };
      })
    );
    return subscriptions;
  }
}
