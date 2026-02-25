import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JSONRpcProvider } from 'opnet';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { getRpcUrl, DEFAULT_NETWORK } from './config';
import { ProviderContext } from './context/ProviderContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { SendTip } from './pages/SendTip';
import { MyJar } from './pages/MyJar';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';

function ProviderWrapper({ children }: { children: React.ReactNode }) {
  const { network: walletNetwork } = useWalletConnect();
  const network = walletNetwork ?? DEFAULT_NETWORK;

  const value = useMemo(() => {
    const url = getRpcUrl(network);
    const provider = new JSONRpcProvider({ url, network });
    return { provider, network };
  }, [network]);

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/send" element={<SendTip />} />
      <Route path="/jar" element={<MyJar />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProviderWrapper>
        <div className="app">
          <Header />
          <main className="main">
            <AppRoutes />
          </main>
        </div>
      </ProviderWrapper>
    </BrowserRouter>
  );
}
