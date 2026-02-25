import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletConnectProvider } from '@btc-vision/walletconnect';
import App from './App';
import './styles/index.css';

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <WalletConnectProvider theme="dark">
        <App />
      </WalletConnectProvider>
    </React.StrictMode>,
  );
}
