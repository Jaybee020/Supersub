import { Address, baseSepolia, optimismSepolia, polygonAmoy, polygonMumbai, sepolia } from '@alchemy/aa-core';
import { config as envConfig } from 'dotenv';
import { UserAccount } from './account';
import { Subscription } from './subscription';
import { AlchemyProvider, Contract, formatEther, Networkish, parseEther, Wallet, ZeroAddress } from 'ethers';
import { getDeploymentAddressesByChain } from './config';
import { abi } from '../artifacts/contracts/CCIP.sol/SubscriptionTokenBridge.json';

envConfig();

// Supported Networks

// Ethereum Mainnet (mainnet)
// Goerli Testnet (goerli)
// Sepolia Testnet (sepolia)
// Arbitrum (arbitrum)
// Arbitrum Goerli Testnet (arbitrum-goerli)
// Arbitrum Sepolia Testnet (arbitrum-sepolia)
// Base (base)
// Base Goerlia Testnet (base-goerli)
// Base Sepolia Testnet (base-sepolia)
// Optimism (optimism)
// Optimism Goerli Testnet (optimism-goerli)
// Optimism Sepolia Testnet (optimism-sepolia)
// Polygon (matic)
// Polygon Amoy Testnet (matic-amoy)
// Polygon Mumbai Testnet (matic-mumbai)

//'0xf3e04Aeab32569c69F60f44fBA797922FC6b1cE2' use for everything except createRecurringPayment

export const subscriptionPluginAddr: Address = getDeploymentAddressesByChain('baseSepolia').subscriptionPlugin;
export const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
export const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
export const PRIVATE_KEY_3 = process.env.PRIVATE_KEY_3;
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const accountSalt = 23;
const correspondingChain = baseSepolia;
const chainId = correspondingChain.id;
const subscription = new Subscription(chainId, subscriptionPluginAddr);

export const ACCOUNT_ABSTRATION_POLICY_ID = process.env.ACCOUNT_ABSTRATION_POLICY_ID;

async function createProduct(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const signer = new Wallet(PRIVATE_KEY_2!, provider);
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const accountClient = await account.initializeAccountClient();
  const subscription = new Subscription(chainId, subscriptionPluginAddr);
  const productName = 'Spotify inc';
  const productLogoUrl = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Black.png';
  const productDescription = 'Spotify is a digital music service that gives you access to millions of songs.';
  const productType = 1;
  const initialPlans = [
    {
      price: 100000,
      chargeInterval: 24 * 3600 * 30,
      tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      receivingAddress: '0x9d1bc836941319df22C3Dd9Ebba6EB1eE058b623',
      destinationChain: sepolia.id,
    },
    {
      price: 100000000000000,
      chargeInterval: 24 * 3600 * 30,
      tokenAddress: ZeroAddress,
      receivingAddress: '0x9d1bc836941319df22C3Dd9Ebba6EB1eE058b623',
      destinationChain: baseSepolia.id,
    },
  ];
  await account.createProduct(subscription, productName, productDescription, productLogoUrl, productType, initialPlans);
  // await subscription.createProduct(productName, productDescription, productLogoUrl, productType);
}

async function createRecurringPayment(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const signer = new Wallet(PRIVATE_KEY_2!, provider);
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const smartAccountAddress = (await account.initializeAccountClient()).getAddress();
  console.log('Smart Account Addr', smartAccountAddress);
  const subscription = new Subscription(chainId, subscriptionPluginAddr);
  const duration = 24 * 30 * 12 * 60 * 60;
  const endTime = Math.floor(Date.now() / 1000) + duration;
  const initialPlans = [
    {
      price: 1000000000,
      chargeInterval: 24 * 3600 * 30,
      tokenAddress: ZeroAddress,
      receivingAddress: '0x9d1bc836941319df22C3Dd9Ebba6EB1eE058b623',
      destinationChain: baseSepolia.id,
    },
  ];
  await account.createRecurringPayment(
    subscription,
    initialPlans[0],
    endTime,
    '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  );
}

async function bridge() {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const signer = new Wallet(PRIVATE_KEY_2!, provider);
  const bridge = new Contract(getDeploymentAddressesByChain('polygonAmoy').tokenBridge, abi, signer);
  await bridge.transferToken();
}

async function main(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const signer = new Wallet(PRIVATE_KEY_1!, provider);
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const smartAccountAddress = (await account.initializeAccountClient()).getAddress();
  console.log('Smart Account Addr', smartAccountAddress);

  const planId = Number(await subscription.getTotalPlans());
  console.log(planId);

  const duration = 24 * 30 * 12 * 60 * 60;
  const endTime = Math.floor(Date.now() / 1000) + duration;
  await account.subscribe(subscription, 0, endTime, ZeroAddress);

  console.log('Successfully subscribed');
  console.log(await account.getSubscriptions(subscription));
  console.log(formatEther(100000000000000n));

  // await account.changeSubscriptionPlanPaymentInfo(
  //   subscription,
  //   0,
  //   endTime,
  //   '0x2B0B2894A7003a2617f1C8322951D569Cc6b7cb7'
  // );
}

async function charge(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const subscription = new Subscription(chainId, subscriptionPluginAddr);
  const signer = new Wallet(PRIVATE_KEY_2!, provider);
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const planId = 1;
  console.log(
    await subscription.getSubscriptionPlanById(planId),
    await account.getSubscriptions(subscription),
    await subscription.contract.ccipChainSelectors(BigInt('11155111'))
  );
  const smartAccountAddress = (await account.initializeAccountClient()).getAddress();
  console.log(smartAccountAddress);
  await subscription.charge(planId, smartAccountAddress);
  console.log('Successfully charged subscription');
}

async function unsubscribe(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const subscription = new Subscription(chainId, subscriptionPluginAddr);
  const signer = new Wallet(PRIVATE_KEY_1!, provider);
  // console.log(await subscription.getSubscriptionPlanById(2));
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const smartAccountAddress = (await account.initializeAccountClient()).getAddress();
  await account.unsubscribe(subscription, 2);
  console.log('Successfully charged subscription');
}

async function updateSubscription(chainId: Networkish) {
  const provider = new AlchemyProvider(chainId, ALCHEMY_API_KEY);
  const signer = new Wallet(PRIVATE_KEY_2!, provider);
  const account = new UserAccount(signer.privateKey!, correspondingChain, accountSalt);
  const smartAccountAddress = (await account.initializeAccountClient()).getAddress();
  console.log('Smart Account Addr', smartAccountAddress);
  const subscription = new Subscription(chainId, subscriptionPluginAddr);
  await account.changeSubscriptionPlanPaymentInfo(subscription, 0, undefined, ZeroAddress);
}

//FUNCTIONS TO RUN

// createRecurringPayment(chainId); //0xee558a9391ab56f59c933056c35044573caeb4f63928efb4cdb14cd6a50bb8e4 tx hash of create Recurring Payment

createProduct(chainId); //0xa442fa1f006f09f4f975b6d80f193340062692c29343182e4599771a6e6e02a3 tx hash of product and plan creation(check on polygonscan yourself)
// main();
//First subscribe txnHash 0x763cda5150e6b7068c10bb88f8c205f83449a274fcd946ff3e09e55524d5eb67 of subscription
//Second subscribe txnHash 0xd6dd75b4432c866c8952237b49c3f304ee8e7a0ab06422e9a04addac1992cc00

// charge(chainId); //https://amoy.polygonscan.com/tx/0x681b4e921981fd2ad7c338fae780f74e7017c54a3e826179c9127e3443266460 (charge with native token)
// unsubscribe();
//old adresss
// 0x8cda78ab26ab7e06dae01972a9d47b4ce0f673e1dc16671750fa8155d827cde4 charged in USDC token
// 0x8cda78ab26ab7e06dae01972a9d47b4ce0f673e1dc16671750fa8155d827cde4 charged in USDC token

// version of modular account sdk to use
// "@alchemy/aa-alchemy": "^3.14.1",
// "@alchemy/aa-core": "^3.12.3",
