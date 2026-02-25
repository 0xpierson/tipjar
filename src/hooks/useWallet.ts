import { useCallback, useState } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';

export function useWallet() {
  const walletConnect = useWalletConnect();
  const [error, setError] = useState<Error | null>(null);

  const openConnectModal = useCallback(() => {
    setError(null);
    try {
      walletConnect.openConnectModal();
    } catch (err) {
      const connectError = err instanceof Error ? err : new Error(String(err));
      setError(connectError);
    }
  }, [walletConnect]);

  const disconnect = useCallback(() => {
    setError(null);
    try {
      walletConnect.disconnect();
    } catch (err) {
      const disconnectError = err instanceof Error ? err : new Error(String(err));
      setError(disconnectError);
    }
  }, [walletConnect]);

  const isConnected = walletConnect.address !== null;
  console.log('walletConnect', walletConnect);
  console.log('isConnected', isConnected);
  console.log('address', walletConnect.address);
  console.log('publicKey', walletConnect.publicKey);
  console.log('hashedMLDSAKey', walletConnect.hashedMLDSAKey);
  console.log('mldsaPublicKey', walletConnect.mldsaPublicKey);
  console.log('signer', walletConnect.signer);
  console.log('walletType', walletConnect.walletType);

  return {
    address: walletConnect.walletAddress,
    addressObject: walletConnect.address,
    publicKey: walletConnect.publicKey,
    hashedMLDSAKey: walletConnect.hashedMLDSAKey,
    mldsaPublicKey: walletConnect.mldsaPublicKey,
    isConnected,
    isConnecting: walletConnect.connecting,
    error,
    walletType: walletConnect.walletType,
    signer: walletConnect.signer,
    openConnectModal,
    disconnect,
  };
}

