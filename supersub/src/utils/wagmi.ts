import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

export const defaultChain = baseSepolia;

export const config = createConfig({
  chains: [defaultChain],
  transports: {
    [defaultChain.id]: http(),
  },
});

declare module "wagmi" {
  // @ts-ignore
  interface Register {
    config: typeof config;
  }
}
