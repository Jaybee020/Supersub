import { ZeroAddress } from "ethers";
import { defaultChain } from "utils/wagmi";
import { baseSepolia, polygonAmoy } from "viem/chains";

//TO-DO: CHANGE CHAIN TO BASE
export const supportedTokens = {
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e": {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    symbol: "USDC",
    decimals: 6,
    image_url:
      "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo-128.png",
    chain_id: defaultChain.id,
    chain_name: defaultChain.name,
  },
  "0x4200000000000000000000000000000000000006": {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    decimals: 18,
    image_url:
      "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
    chain_id: defaultChain.id,
    chain_name: defaultChain.name,
  },
  ZeroAddress: {
    address: ZeroAddress,
    symbol: "ETH",
    decimals: 18,
    image_url:
      "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
    chain_id: defaultChain.id,
    chain_name: defaultChain.name,
  },

  "0xE4aB69C077896252FAFBD49EFD26B5D171A32410": {
    address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    symbol: "LINK",
    decimals: 18,
    image_url:
      "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0x514910771af9ca656af840dff83e8264ecf986ca/logo-128.png",
    chain_id: defaultChain.id,
    chain_name: defaultChain.name,
  },
  "0x88A2d74F47a237a62e7A51cdDa67270CE381555e": {
    address: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
    symbol: "CCIP-BnM",
    decimals: 18,
    image_url:
      "https://d2f70xi62kby8n.cloudfront.net/tokens/clccip-lnm.webp?auto=compress%2Cformat",
    chain_id: defaultChain.id,
    chain_name: defaultChain.name,
  },
};

export const supportedChains = {
  // avalanche_testnet: {
  //   image_url:
  //     "https://token.metaswap.codefi.network/assets/networkLogos/avalanche.svg",
  //   chain_selector: 14767482510784806043n,
  //   chain_name: "avalanche_testnet",
  //   short_name: "avax",
  //   chain_id: 43113,
  // },
  optimism_testnet: {
    image_url:
      "https://token.metaswap.codefi.network/assets/networkLogos/optimism.svg",
    chain_selector: 5224473277236331295n,
    chain_name: "optimism_testnet",
    short_name: "optimism",
    chain_id: 11155420,
  },
  sepolia: {
    image_url:
      "https://token.metaswap.codefi.network/assets/networkLogos/ethereum.svg",
    chain_selector: 16015286601757825753n,
    chain_name: "sepolia",
    short_name: "eth",
    chain_id: 11155111,
  },
  polygon_amoy: {
    image_url:
      "https://token.metaswap.codefi.network/assets/networkLogos/polygon.svg",
    chain_selector: 16281711391670634445n,
    chain_name: "polygon amoy",
    short_name: "amoy",
    chain_id: 80002,
  },
  base_sepolia: {
    image_url:
      "https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp",
    chain_selector: 10344971235874465080n,
    chain_name: baseSepolia.name as string,
    short_name: "base",
    chain_id: baseSepolia.id as number,
  },
};

export function getDeploymentAddressesByChain(name: string) {
  const dict = {
    [baseSepolia.name]: {
      subscriptionPlugin: "0x05350fF2de37d4a01581022433406f40Dd6d8352",
      tokenBridge: "0x7F07404723DF0AbFEf333Eefdd0BE60B1d24EF70",
      initBlock: 1,
    },
    [polygonAmoy.name]: {
      subscriptionPlugin: "0x791ab50d4A494376b87426c0D09DED05861c31f9",
      tokenBridge: "0x1F7B6e0A5331412cf28F2ea83804929A41a742F7",
      initBlock: 8630864,
    },
  };
  //@ts-ignore
  return dict[name];
}
