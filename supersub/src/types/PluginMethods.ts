import { Address } from "viem";

interface Plan {
  price: number;
  chargeInterval: number;
  tokenAddress?: string;
  receivingAddress?: string;
  destinationChain?: number;
}

export interface ICreateProductArgs {
  name: string;
  plans: Plan[];
  image: File | null;
  description: string;
  recipient: Address;
  chargeToken: Address;
  destinationChain: number;
}

export interface IRecurringPaymentArgs {
  initPlan: Plan;
  endTime: number;
  paymentToken?: string;
  paymentTokenSwapFee?: number;
  description?: string;
}

export interface ISubscribeParams {
  planId: number;
  endTime: number;
  paymentToken?: string;
  beneficiary?: string;
  paymentTokenSwapFee?: number;
}
