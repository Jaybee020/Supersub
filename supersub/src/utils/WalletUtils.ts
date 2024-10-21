import { createWalletClient, custom } from "viem";
import { ConnectedWallet } from "@privy-io/react-auth";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { alchemy, baseSepolia } from "@account-kit/infra";
import { clientConfig } from "contracts/data";
import PluginClient from "contracts/subscriptionPlugin";
import { defaultChain } from "./wagmi";
import { WalletClientSigner } from "@aa-sdk/core";

const generateSmartWallet = async (privyEoa: ConnectedWallet) => {
  const privyProvider = await privyEoa.getEthereumProvider();
  const privyClient = createWalletClient({
    account: privyEoa.address as `0x${string}`,
    transport: custom(privyProvider),
  });
  const privySigner = new WalletClientSigner(privyClient, "json-rpc");
  await createModularAccountAlchemyClient({
    transport: alchemy({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
    chain: baseSepolia,
    signer: privySigner,
  });

  const smartAccountClient = await createModularAccountAlchemyClient({
    signer: privySigner,
    transport: alchemy({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
    chain: baseSepolia,
    policyId: import.meta.env.VITE_ACCOUNT_ABSTRATION_POLICY_ID,
  });

  const client = new PluginClient(
    defaultChain.id,
    clientConfig.subscriptionPluginAddr,
    clientConfig.abi,
    clientConfig.ccipBridgeAddr,
    clientConfig.bridgeAbi,

    smartAccountClient,
    clientConfig.provider
  );

  return {
    smartAccountClient,
    pluginClient: client,
    account: smartAccountClient.account,
  };
};

export { generateSmartWallet };
