// import { parseEther } from 'ethers/lib/utils';
// import { providers, Wallet } from 'ethers';

// import { getRPCUrl, config } from '../env';
// import { RequestProvider } from './main';

// async function main() {
//   const chainName = 'sepolia';
//   const requestProvider = new RequestProvider(chainName);
//   const chainProvider = new providers.JsonRpcProvider(getRPCUrl(chainName));
//   const payer = new Wallet(config.PRIVATE_KEY, chainProvider);
//   const { request } = await requestProvider.createNativeTokenPaymentRequest(
//     payer.address,
//     '0x9d1bc836941319df22C3Dd9Ebba6EB1eE058b623',
//     parseEther('0.0001').toString(),
//     10,
//   );
//   await requestProvider.payRequest(request, payer);
// }

// main();
