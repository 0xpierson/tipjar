import { networks, type Network } from '@btc-vision/bitcoin';

const RPC_URLS: Record<'regtest' | 'opnetTestnet' | 'mainnet', string> = {
  regtest: 'https://regtest.opnet.org',
  opnetTestnet: 'https://testnet.opnet.org',
  mainnet: 'https://mainnet.opnet.org',
};

// Prefer the dedicated OPNet testnet network if available; fall back to legacy `testnet`.
const OP_NET_TESTNET_NETWORK: Network =
  (networks as typeof networks & { opnetTestnet?: Network }).opnetTestnet;

export function getRpcUrl(_network: Network | null | undefined): string {
  // Tipjar currently only supports OPNet testnet; always use the testnet RPC.
  return RPC_URLS.opnetTestnet;
}

export function getOpscanNetworkParam(_network: Network | null | undefined): string {
  // Tipjar currently only supports OPNet testnet.
  return 'opnetTestnet';
}

export const DEFAULT_NETWORK: Network = OP_NET_TESTNET_NETWORK;

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
  address: '0xb09fc29c112af8293539477e23d8df1d3126639642767d707277131352040cbb',
  decimals: 8,
};

export const MOTO_TOKEN: TipTokenConfig = {
  id: 'MOTO',
  symbol: 'MOTO',
  name: 'MOTO',
  address: '0xfd4473840751d58d9f8b73bdd57d6c5260453d5518bd7cd02d0a4cf3df9bf4dd',
  decimals: 8,
};
