import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { formatAddress } from '../utils/format';
import { useWallet } from '../hooks/useWallet';
import { useProvider } from '../context/ProviderContext';
import logo from '../assets/logo.png';

function formatBtcBalance(balanceSats: bigint): string {
  const sign = balanceSats < 0n ? '-' : '';
  const abs = balanceSats < 0n ? -balanceSats : balanceSats;
  const base = 100_000_000n;
  const whole = abs / base;
  const fraction = abs % base;

  if (fraction === 0n) {
    return `${sign}${whole.toString()}`;
  }

  const fractionStr = fraction.toString().padStart(8, '0').replace(/0+$/, '');
  return `${sign}${whole.toString()}.${fractionStr}`;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected, openConnectModal, disconnect } = useWallet();
  const { provider } = useProvider();
  const [btcBalance, setBtcBalance] = useState<bigint | null>(null);

  const handleConnect = (): void => {
    openConnectModal();
  };

  const displayAddress = address ?? '';

  useEffect(() => {
    let cancelled = false;

    async function fetchBtcBalance() {
      if (!isConnected || !displayAddress) {
        setBtcBalance(null);
        return;
      }

      try {
        const balance = await provider.getBalance(displayAddress, true);
        if (!cancelled) {
          setBtcBalance(balance);
        }
      } catch (err) {
        if (!cancelled) {
          setBtcBalance(null);
          // eslint-disable-next-line no-console
          console.error('Failed to fetch BTC balance', err);
        }
      }
    }

    fetchBtcBalance();

    return () => {
      cancelled = true;
    };
  }, [isConnected, displayAddress, provider]);

  return (
    <header className={`header ${isMenuOpen ? 'header-menu-open' : ''}`}>
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={logo} alt="Tip Jar logo" className="logo-mark" />
        </Link>
        <nav className="nav" id="primary-navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/send"
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            onClick={() => setIsMenuOpen(false)}
          >
            Send tip
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/how-it-works"
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            onClick={() => setIsMenuOpen(false)}
          >
            How it works
          </NavLink>
          <NavLink
            to="/jar"
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            onClick={() => setIsMenuOpen(false)}
          >
            My jar
          </NavLink>
        </nav>
      </div>
      <div className="header-right">
        {isConnected && displayAddress ? (
          <>
            <div className="wallet-row">
              <span className="address" title={displayAddress}>
                {formatAddress(displayAddress)}
              </span>
              {btcBalance !== null && (
                <span className="address" style={{ marginLeft: '0.5rem' }}>
                  BTC: {formatBtcBalance(btcBalance)}
                </span>
              )}
              <button type="button" className="btn btn-ghost" onClick={disconnect}>
                Disconnect
              </button>
            </div>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className="menu-toggle-icon">
                <span />
                <span />
                <span />
              </span>
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={handleConnect}>
              Connect wallet
            </button>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className="menu-toggle-icon">
                <span />
                <span />
                <span />
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
