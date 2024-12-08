import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
// import '@nomicfoundation/hardhat-foundry';
import 'hardhat-abi-exporter';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  gasReporter: {
    enabled: true,
  },
  abiExporter: {
    runOnCompile: true,
    only: ['SubscriptionPlugin', 'SubscriptionManager'],
    path: './abis',
    format: 'json',
    clear: true,
  },
  networks:
    process.env.ALCHEMY_API_KEY && process.env.PRIVATE_KEY_1
      ? {
          hardhat: {
            allowUnlimitedContractSize: true,
          },
          ethSepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY!}`,
            chainId: 11155111,
            accounts: [process.env.PRIVATE_KEY_1!],
          },
          baseSepolia: {
            url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY!}`,
            chainId: 84532,
            accounts: [process.env.PRIVATE_KEY_1!],
          },
          arbitrumSepolia: {
            url: `https://arb-sepolia.g.alchemy.com/v2${process.env.ALCHEMY_API_KEY!}`,
            chainId: 1,
            accounts: [process.env.PRIVATE_KEY_1!],
          },
          polygonAmoy: {
            url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY!}`,
            chainId: 80002,
            accounts: [process.env.PRIVATE_KEY_1!],
          },
        }
      : undefined,
  etherscan: process.env.POLYGON_AMOY_EXPLORER_API_KEY
    ? {
        customChains: [
          {
            network: 'polygonAmoy',
            chainId: 80002,
            urls: {
              apiURL: 'https://api-testnet.polygonscan.com/api',
              browserURL: 'https://amoy.polygonscan.com/',
            },
          },
        ],
        apiKey: {
          polygonAmoy: process.env.POLYGON_AMOY_EXPLORER_API_KEY!,
        },
      }
    : undefined,
  sourcify: {
    enabled: true,
  },
};

export default config;
