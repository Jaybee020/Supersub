import { baseSepolia } from 'viem/chains';
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
  };
  return dict[String(chainId)];
}
