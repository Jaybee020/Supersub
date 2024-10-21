import { arbitrumSepolia, optimismSepolia, polygonAmoy, sepolia } from 'viem/chains';
import { describe, expect, it } from 'vitest';

import { solidityTimestampToDateTime, getEvmHttpClient, bytes32ToText, hexToString } from '~/pkg/evm/utils';
import { generateApiKeyPair, getUniqueElements, getRanges, chunks } from '~/utils';

describe('getUniqueElements', () => {
  it('should return unique elements from arr1 that are not present in arr2', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [3, 4, 6, 7, 8];
    const expected = [1, 2, 5];
    expect(getUniqueElements(arr1, arr2)).toEqual(expected);
  });

  it('should return an empty array if all elements in arr1 are present in arr2', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3, 4, 5];
    const expected: number[] = [];
    expect(getUniqueElements(arr1, arr2)).toEqual(expected);
  });
});

describe('chunks', () => {
  it('should split the input array into chunks of the specified size', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunkSize = 3;
    const expected = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(chunks(input, chunkSize)).toEqual(expected);
  });

  it('should handle arrays with length not divisible by the chunk size', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const chunkSize = 3;
    const expected = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8],
    ];
    expect(chunks(input, chunkSize)).toEqual(expected);
  });
});

describe('getRanges', () => {
  it('should return the correct ranges of numbers', () => {
    const begin = 1;
    const finish = 10;
    const chunkSize = 3;
    const expected = [
      [BigInt(1), BigInt(3)],
      [BigInt(4), BigInt(6)],
      [BigInt(7), BigInt(9)],
      [BigInt(10), BigInt(10)],
    ];
    expect(getRanges(begin, finish, chunkSize)).toEqual(expected);
  });

  it('should handle cases where the range is smaller than the chunk size', () => {
    const begin = 1;
    const finish = 3;
    const chunkSize = 5;
    const expected = [[BigInt(1), BigInt(3)]];
    expect(getRanges(begin, finish, chunkSize)).toEqual(expected);
  });
});

describe('hexToString', () => {
  it('should convert a hex string to a regular string', () => {
    const cases: { hex: `0x${string}`; expected: string }[] = [
      { hex: '0x416e7468726f706963', expected: 'Anthropic' },
      { hex: '0x48656c6c6f', expected: 'Hello' },
      { hex: '0x576f726c64', expected: 'World' },
      { hex: '0x436f6465', expected: 'Code' },
      { expected: '', hex: '0x' },
    ];

    cases.forEach(({ expected, hex }) => {
      const result = hexToString(hex);
      expect(result).toBe(expected);
    });
  });
});

describe('getEvmClient', () => {
  it('should return a public client with the correct transport and chain', () => {
    const chains = [polygonAmoy, sepolia, optimismSepolia, arbitrumSepolia];
    chains.forEach((chain) => {
      const client = getEvmHttpClient(chain);

      expect(client.chain).toBe(chain);
      expect(client.transport.type).toStrictEqual('http');
      expect(client.transport.name).toStrictEqual('HTTP JSON-RPC');
    });
  });
});

describe('solidityTimestampToDateTime', () => {
  it('should convert a Solidity timestamp to a JavaScript Date object', () => {
    const cases = [
      { expected: new Date('2023-05-25T23:30:00.000Z'), solidityTimestamp: BigInt('1685057400') }, // May 25, 2023 18:30:00 UTC
      { expected: new Date('2023-07-04T13:20:00.000Z'), solidityTimestamp: BigInt('1688476800') }, // July 3, 2023 00:00:00 UTC
      { expected: new Date('2023-01-01T00:00:00.000Z'), solidityTimestamp: BigInt('1672531200') }, // January 1, 2023 00:00:00 UTC
      { expected: new Date('2024-01-01T00:00:00.000Z'), solidityTimestamp: BigInt('1704067200') }, // January 1, 2024 00:00:00 UTC
      { expected: new Date('1970-01-01T00:00:00.000Z'), solidityTimestamp: BigInt('0') }, // Unix epoch
    ];

    cases.forEach(({ solidityTimestamp, expected }) => {
      const result = solidityTimestampToDateTime(solidityTimestamp);
      expect(result).toEqual(expected);
    });
  });
});

describe('generateApiKeyPair', () => {
  it('should return an object with publicKey and secretKey properties', () => {
    const apiKeyPair = generateApiKeyPair();

    expect(apiKeyPair).toHaveProperty('publicKey');
    expect(apiKeyPair).toHaveProperty('secretKey');
  });

  it('publicKey should start with "pk_" and have length of 35', () => {
    const apiKeyPair = generateApiKeyPair();
    const publicKey = apiKeyPair.publicKey;

    expect(publicKey.startsWith('pk_')).toBe(true);
    expect(publicKey.length).toBe(35);
  });

  it('secretKey should start with "sk_" and have length of 35', () => {
    const apiKeyPair = generateApiKeyPair();
    const secretKey = apiKeyPair.secretKey;

    expect(secretKey.startsWith('sk_')).toBe(true);
    expect(secretKey.length).toBe(35);
  });
});

describe('bytes32ToText', () => {
  it('should work correctly', () => {
    const cases: { bytes32: `0x${string}`; expected: string }[] = [
      { bytes32: '0x53706f74696679204e474e000000000000000000000000000000000000000000', expected: 'Spotify NGN' },
    ];

    cases.forEach(({ expected, bytes32 }) => {
      const result = bytes32ToText(bytes32);
      expect(result).toEqual(expected);
    });
  });
});
