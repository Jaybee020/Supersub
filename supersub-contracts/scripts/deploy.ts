import { ethers } from 'hardhat';
import { deploymentVariablesDict, getDeploymentAddressesByChain } from './config';

type Network = 'testnet' | 'mainnet';
type Chain = 'eth' | 'base' | 'polygon' | 'arbitrum' | 'optimism';

async function deploySubscriptionManager(network: Network, chain: Chain) {
  const deploymentVars = deploymentVariablesDict[network][chain];
  let tokenBridgeAddr = '';

  console.log(deploymentVars.ccipChainSelector);
  if (!tokenBridgeAddr || tokenBridgeAddr.length == 0) {
    const tokenBridge = await ethers.deployContract('SubscriptionTokenBridge', [
      deploymentVars.cciprouter,
      deploymentVars.link,
      deploymentVars.ccipChainSelector,
    ]);
    await tokenBridge.waitForDeployment();
    tokenBridgeAddr = tokenBridge.target as string;
    console.log(`TokenBridge Manager  Deployed At: ${tokenBridge.target}`);
  }
  const subscriptionManger = await ethers.deployContract('ProductSubscriptionManagerPlugin', [
    deploymentVars.supportedTokens,
    deploymentVars.bridgingChainID,
    deploymentVars.ccipChainSelector,
    deploymentVars.chainId,
    deploymentVars.swapFactoryAddr,
    deploymentVars.swapRouterAddr,
    deploymentVars.WETH,
    tokenBridgeAddr,
  ]);

  await subscriptionManger.waitForDeployment();
  console.log(`Subscription Manager  Deployed At: ${subscriptionManger.target}`);
}

async function deployCCIP(network: Network, chain: Chain) {}

// deploy("testnet", "zkEVM").catch((error) => console.log(error));
deploySubscriptionManager('testnet', 'base').catch((error) => console.log(error));
