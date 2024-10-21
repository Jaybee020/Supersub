import { AlchemyProvider } from "ethers";
import { Address } from "@aa-sdk/core";
import abi from "./abis/ProductSubscriptionManagerPlugin.json";
import { abi as bridgeAbi } from "./abis/SubscriptionTokenBridge.json";
import { defaultChain } from "utils/wagmi";
import { getDeploymentAddressesByChain } from "constants/data";

const subscriptionPluginAddr: Address = getDeploymentAddressesByChain(
  defaultChain.name
).subscriptionPlugin;
const ccipBridgeAddr: Address = getDeploymentAddressesByChain(
  defaultChain.name
).tokenBridge;

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const ACCOUNT_ABSTRATION_POLICY_ID = import.meta.env
  .VITE_ACCOUNT_ABSTRATION_POLICY_ID;

const provider = new AlchemyProvider(defaultChain.id, ALCHEMY_API_KEY);

export const clientConfig = {
  // Contract abi(s)
  abi,
  bridgeAbi,

  // Alchemy
  ALCHEMY_API_KEY,
  ACCOUNT_ABSTRATION_POLICY_ID,

  // Provider
  provider,

  // Addresses
  ccipBridgeAddr,
  subscriptionPluginAddr,
  PRIVATE_KEY_1: null,
  PRIVATE_KEY_2: null,
  PRIVATE_KEY_3: null,
};
