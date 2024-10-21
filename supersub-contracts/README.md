# Supersub Contracts

This repository contains the core smart contracts for [Supersub](https://supersub.vercel.app/), a subscription platform powered by Alchemy's account abstraction [infrastructure](https://www.alchemy.com/account-abstraction-infrastructure) and Chainlink's [Cross-chain interoperability protocol](https://chain.link/cross-chain). The contracts are divided into two main components; [`Subscription Plugin`](contracts/SubscriptionPlugin.sol) and [`Cross chain Bridge`](contracts/CCIP.sol).

## Subscription Plugin

This contract implements the [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) standard, empowering Supersub's smart contract accounts with subscription capabilities. By installing this plugin, smart accounts gain the ability to create products and plans, set up recurring subscriptions, subscribe to services, and manage active subscriptions seamlessly.

### Deployment Addresses

|  Blockchain  |                                                            Address                                                            |
| :----------: | :---------------------------------------------------------------------------------------------------------------------------: |
| Base Sepolia | [0x05350fF2de37d4a01581022433406f40Dd6d8352](https://sepolia.basescan.com/address/0x05350fF2de37d4a01581022433406f40Dd6d8352) |
| Base mainnet |                                                          Coming Soon                                                          |

### Supported Destination chains

The plugin allows service providers to accept subscription on other chains using the chainlink CCIP bridge. Users can pay for subscription on Base sepolia or Base mainnetand the plugin routes the tokens to the supported destination chains as specified by the service provider. Below are the list of supported destination chains for both Base sepolia and polygon POS.

| Source Chain |                 Supported destination chains                 |
| :----------: | :----------------------------------------------------------: |
| Base sepolia | `Ethereum Sepolia`, `Avalanche Fuji`, and `Optimism Sepolia` |
| Base mainnet |                         Coming soon                          |

## Bridge Contract

This contract leverages the Chainlink Cross-Chain Interoperability Protocol (CCIP), allowing secure asset transfers between different blockchain networks. It enables providers to accept subscriptions on multiple chains and also allows users send assets to multiple chains.

### Deployment Addresses

|  Blockchain  |                                                            Address                                                            |
| :----------: | :---------------------------------------------------------------------------------------------------------------------------: |
| Base sepolia | [0x28689f559337a8851b53ab5f3e0ddd39e5d145eb](https://sepolia.basescan.com/address/0x28689f559337a8851b53ab5f3e0ddd39e5d145eb) |
| Base mainnet |                                                          Coming Soon                                                          |

### Supported Destination chains

The plugin allows service providers to accept subscription on other chains using the chainlink CCIP bridge. Users can pay for subscription on Base sepolia or Base mainnet and the plugin routes the tokens to the supported destination chains as specified by the service provider. Below are the list of supported destination chains for both Base sepolia and polygon POS.

| Source Chain |                Supported destination chains                |
| :----------: | :--------------------------------------------------------: |
| Base sepolia | `Ethereum Sepolia`, `Avalanche Fuji`and `Optimism Sepolia` |
| Base mainnet |                        Coming soon                         |

## Development

### Prerequisites

- Node.js installed on your machine
- Hardhat installation Link here

### Installation

- Clone the repository
- `cd supersub-contracts`
- Install dependencies: `npm install`

### Testing

Run Hardhat Tests:
`npx hardhat test`

Built with love ❤️ from 🇳🇬🚀.
