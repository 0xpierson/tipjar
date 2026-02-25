import { createContext, useContext } from 'react';
import type { JSONRpcProvider } from 'opnet';
import type { Network } from '@btc-vision/bitcoin';

export interface ProviderContextType {
  provider: JSONRpcProvider;
  network: Network;
}

const ProviderContext = createContext<ProviderContextType | null>(null);

export function useProvider(): ProviderContextType {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProvider must be used within ProviderContext');
  return ctx;
}

export { ProviderContext };
