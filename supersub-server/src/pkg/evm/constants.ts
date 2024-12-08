import { baseSepolia, polygonAmoy, sepolia } from 'viem/chains';
import { getAddress } from 'viem';

export const CHUNK_SIZE = 3000;
export const SUBSCRIPTION_PLUGIN_INIT_BLOCK = 7611467n;
export const ALCHEMY_WEBHOOK_ID = 'wh_gef4b1xyathmy1qm';
export const SUBSCRIPTION_PLUGIN_ADDRESS = getAddress('0x37604f45111AB488aeC38DBb17F90Ef1CC90cc32');

interface deploymentVars {
  subscriptionPlugin: string;
  tokenBridge: string;
  initBlock: number;
}
export function getDeploymentVarsByChain(chainId: string | number) {
  const dict: Record<string, deploymentVars> = {
    [baseSepolia.id]: {
      subscriptionPlugin: '0x05350fF2de37d4a01581022433406f40Dd6d8352',
      tokenBridge: '0x7F07404723DF0AbFEf333Eefdd0BE60B1d24EF70',
      initBlock: 16857883,
    },
    [polygonAmoy.id]: {
      subscriptionPlugin: '0x791ab50d4A494376b87426c0D09DED05861c31f9',
      tokenBridge: '0x1F7B6e0A5331412cf28F2ea83804929A41a742F7',
      initBlock: 8630864,
    },
    [sepolia.id]: {
      subscriptionPlugin: '0xC3Ee675b5bb22284f10343cb0686d55Db607fc33',
      tokenBridge: '0x503Ec91A177CA57031580dAeb098430d6bF8Fb03',
      initBlock: 7202016,
    },
  };
  return dict[String(chainId)];
}
