import { ZeroAddress } from "ethers";
import { Dictionary } from "lodash";
import { defaultChain } from "utils/wagmi";
import {
  baseSepolia,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from "viem/chains";

interface IToken {
  address: string;
  symbol: string;
  decimals: number;
  image_url: string;
  chain_id: number;
  chain_name: string;
}

interface IChain {
  image_url: string;
  chain_selector: bigint;
  chain_name: string;
  short_name: string;
  chain_id: number;
  scan_url?: string;
}

export const supportedTokensByChain: Dictionary<Dictionary<IToken>> = {
  [baseSepolia.id]: {
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e": {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      symbol: "USDC",
      decimals: 6,
      image_url:
        "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo-128.png",
      chain_id: baseSepolia.id,
      chain_name: baseSepolia.name,
    },
    "0x4200000000000000000000000000000000000006": {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      decimals: 18,
      image_url:
        "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
      chain_id: baseSepolia.id,
      chain_name: baseSepolia.name,
    },
    [ZeroAddress]: {
      address: ZeroAddress,
      symbol: "ETH",
      decimals: 18,
      image_url:
        "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
      chain_id: baseSepolia.id,
      chain_name: baseSepolia.name,
    },

    "0xE4aB69C077896252FAFBD49EFD26B5D171A32410": {
      address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
      symbol: "LINK",
      decimals: 18,
      image_url:
        "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0x514910771af9ca656af840dff83e8264ecf986ca/logo-128.png",
      chain_id: baseSepolia.id,
      chain_name: baseSepolia.name,
    },
    "0x88A2d74F47a237a62e7A51cdDa67270CE381555e": {
      address: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
      symbol: "CCIP-BnM",
      decimals: 18,
      image_url:
        "https://d2f70xi62kby8n.cloudfront.net/tokens/clccip-lnm.webp?auto=compress%2Cformat",
      chain_id: baseSepolia.id,
      chain_name: baseSepolia.name,
    },
  },
  [polygonAmoy.id]: {
    "0xE4aB69C077896252FAFBD49EFD26B5D171A32410": {
      address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
      symbol: "LINK",
      decimals: 18,
      image_url:
        "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0x514910771af9ca656af840dff83e8264ecf986ca/logo-128.png",
      chain_id: polygonAmoy.id,
      chain_name: polygonAmoy.name,
    },
    "0x88A2d74F47a237a62e7A51cdDa67270CE381555e": {
      address: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
      symbol: "CCIP-BnM",
      decimals: 18,
      image_url:
        "https://d2f70xi62kby8n.cloudfront.net/tokens/clccip-lnm.webp?auto=compress%2Cformat",
      chain_id: polygonAmoy.id,
      chain_name: polygonAmoy.name,
    },
  },
  [sepolia.id]: {
    "0x779877A7B0D9E8603169DdbD7836e478b4624789": {
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      symbol: "LINK",
      decimals: 18,
      image_url:
        "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0x514910771af9ca656af840dff83e8264ecf986ca/logo-128.png",
      chain_id: sepolia.id,
      chain_name: sepolia.name,
    },
    [ZeroAddress]: {
      address: ZeroAddress,
      symbol: "ETH",
      decimals: 18,
      image_url:
        "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
      chain_id: sepolia.id,
      chain_name: sepolia.name,
    },
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      decimals: 6,
      image_url:
        "https://raw.githubusercontent.com/SmolDapp/tokenAssets/d8c660cf4e95f94db50463882d5f6fe49ed61d2a/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo-128.png",
      chain_id: sepolia.id,
      chain_name: sepolia.name,
    },

    "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": {
      address: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
      symbol: "WETH",
      decimals: 18,
      image_url:
        "https://logowik.com/content/uploads/images/ethereum-eth7803.logowik.com.webp",
      chain_id: sepolia.id,
      chain_name: sepolia.name,
    },
  },
};

//TO-DO: CHANGE CHAIN TO BASE
export const supportedTokens = supportedTokensByChain[defaultChain.id];

export const supportedChains: Dictionary<IChain> = {
  // avalanche_testnet: {
  //   image_url:
  //     "https://token.metaswap.codefi.network/assets/networkLogos/avalanche.svg",
  //   chain_selector: 14767482510784806043n,
  //   chain_name: "avalanche_testnet",
  //   short_name: "avax",
  //   chain_id: 43113,
  // },
  [optimismSepolia.id]: {
    image_url:
      "https://token.metaswap.codefi.network/assets/networkLogos/optimism.svg",
    chain_selector: 5224473277236331295n,
    chain_name: "optimism_testnet",
    short_name: "optimism",
    chain_id: 11155420,
    scan_url: "https://sepolia.etherscan.io",
  },
  [sepolia.id]: {
    image_url:
      "https://seeklogo.com/images/E/ethereum-logo-EC6CDBA45B-seeklogo.com.png",
    chain_selector: 16015286601757825753n,
    chain_name: "sepolia",
    short_name: "eth",
    chain_id: 11155111,
  },
  [polygonAmoy.id]: {
    image_url:
      "https://token.metaswap.codefi.network/assets/networkLogos/polygon.svg",
    chain_selector: 16281711391670634445n,
    chain_name: "polygon amoy",
    short_name: "amoy",
    chain_id: 80002,
  },
  [baseSepolia.id]: {
    image_url:
      "https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp",
    chain_selector: 10344971235874465080n,
    chain_name: baseSepolia.name as string,
    short_name: "base",
    chain_id: baseSepolia.id,
  },
};

export function getDeploymentAddressesByChain(name: string) {
  const dict = {
    [baseSepolia.name]: {
      subscriptionPlugin: "0x05350fF2de37d4a01581022433406f40Dd6d8352",
      tokenBridge: "0x7F07404723DF0AbFEf333Eefdd0BE60B1d24EF70",
      initBlock: 16857883,
    },
    [polygonAmoy.name]: {
      subscriptionPlugin: "0x791ab50d4A494376b87426c0D09DED05861c31f9",
      tokenBridge: "0x1F7B6e0A5331412cf28F2ea83804929A41a742F7",
      initBlock: 8630864,
    },
    [sepolia.name]: {
      subscriptionPlugin: "0xC3Ee675b5bb22284f10343cb0686d55Db607fc33",
      tokenBridge: "0x503Ec91A177CA57031580dAeb098430d6bF8Fb03",
      initBlock: 7202016,
    },
  };
  //@ts-ignore
  return dict[name];
}
