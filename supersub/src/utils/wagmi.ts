import { http } from "wagmi";
import { createConfig } from "@privy-io/wagmi";
import { sepolia } from "@account-kit/infra";
import { Network } from "alchemy-sdk";

export const defaultChain = sepolia;
export const defaultNetwork = Network.ETH_SEPOLIA;

export const defaultToken = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

export const config = createConfig({
  chains: [defaultChain],
  transports: {
    [defaultChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
