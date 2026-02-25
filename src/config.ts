import { networks, type Network } from '@btc-vision/bitcoin';

const RPC_URLS: Record<'regtest' | 'opnetTestnet' | 'mainnet', string> = {
  regtest: 'https://regtest.opnet.org',
  opnetTestnet: 'https://testnet.opnet.org',
  mainnet: 'https://mainnet.opnet.org',
};

const OP_NET_TESTNET_NETWORK: Network = (networks as typeof networks & {
  readonly opnetTestnet: Network;
}).opnetTestnet;

function isSameNetwork(a: Network | null | undefined, b: Network): boolean {
  if (!a) return false;
  return (
    a.bech32 === b.bech32 &&
    a.pubKeyHash === b.pubKeyHash &&
    a.scriptHash === b.scriptHash
  );
}

export function getRpcUrl(network: Network | null | undefined): string {
  if (isSameNetwork(network, networks.regtest)) return RPC_URLS.regtest;
  if (isSameNetwork(network, OP_NET_TESTNET_NETWORK)) return RPC_URLS.opnetTestnet;
  return RPC_URLS.mainnet;
}

export const DEFAULT_NETWORK: Network = networks.regtest;

export const MAX_NOTE_BYTES = 80;

export interface TipTokenConfig {
  readonly id: 'PILL' | 'MOTO';
  readonly symbol: string;
  readonly name: string;
  readonly address: string;
  readonly decimals: number;
}

export const PILL_TOKEN: TipTokenConfig = {
  id: 'PILL',
  symbol: 'PILL',
  name: 'PILL',
  address: '0xfb7df2f08d8042d4df0506c0d4cee3cfa5f2d7b02ef01ec76dd699551393a438',
  decimals: 8,
};

export const MOTO_TOKEN: TipTokenConfig = {
  id: 'MOTO',
  symbol: 'MOTO',
  name: 'MOTO',
  address: '0x0a6732489a31e6de07917a28ff7df311fc5f98f6e1664943ac1c3fe7893bdab5',
  decimals: 8,
};
