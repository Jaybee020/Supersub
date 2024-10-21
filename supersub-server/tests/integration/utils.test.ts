import { optimismSepolia, polygonAmoy, sepolia } from 'viem/chains';
import { describe, expect, it } from 'vitest';

import { getMultiOwnerModularAccountAddresses } from '~/pkg/evm/utils';

describe('getMultiOwnerModularAccountAddresses', () => {
  it('should return the correct account addresses for the given owners', async () => {
    const expected: Record<`0x${string}`, `0x${string}`> = {
      '0x19e4057A38a730be37c4DA690b103267AAE1d75d': '0x564BB9C687BE0Ff8474aD67b9D2c6a1b402A86C7',
      '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9': '0xeA20DB45a5D8FdF65249Eb5d22b0730aB7d2Ba9A',
      '0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d': '0x130233195449F1046F77b1bd93ab9243361BB7E8',
    };

    const result = await getMultiOwnerModularAccountAddresses(sepolia, Object.keys(expected) as `0x${string}`[]);
    expect(result).toMatchObject(expected);
  });

  it('should return the same account addresses for the given owners on different chains', async () => {
    const expected: Record<`0x${string}`, `0x${string}`> = {
      '0x19e4057A38a730be37c4DA690b103267AAE1d75d': '0x564BB9C687BE0Ff8474aD67b9D2c6a1b402A86C7',
      '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9': '0xeA20DB45a5D8FdF65249Eb5d22b0730aB7d2Ba9A',
      '0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d': '0x130233195449F1046F77b1bd93ab9243361BB7E8',
    };

    const amoyResult = await getMultiOwnerModularAccountAddresses(
      polygonAmoy,
      Object.keys(expected) as `0x${string}`[],
    );
    const sepoliaResult = await getMultiOwnerModularAccountAddresses(
      sepolia,
      Object.keys(expected) as `0x${string}`[],
    );
    const optimismSepoliaResult = await getMultiOwnerModularAccountAddresses(
      optimismSepolia,
      Object.keys(expected) as `0x${string}`[],
    );

    expect(amoyResult).toMatchObject(expected);
    expect(sepoliaResult).toMatchObject(expected);
    expect(optimismSepoliaResult).toMatchObject(expected);
  });
});
