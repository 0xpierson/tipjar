import { useState, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';

export function MyJar() {
  const { address } = useWallet();
  const [lastCopied, setLastCopied] = useState<'address' | 'link' | null>(null);

  const jarUrl =
    typeof window !== 'undefined' && address
      ? `${window.location.origin}/send?to=${encodeURIComponent(address)}`
      : '';

  const copyAddress = useCallback(() => {
    if (!address) return;
    void navigator.clipboard.writeText(address).then(() => {
      setLastCopied('address');
      setTimeout(() => setLastCopied(null), 2000);
    });
  }, [address]);

  const copyLink = useCallback(() => {
    if (!jarUrl) return;
    void navigator.clipboard.writeText(jarUrl).then(() => {
      setLastCopied('link');
      setTimeout(() => setLastCopied(null), 2000);
    });
  }, [jarUrl]);

  if (!address) {
    return (
      <section className="card">
        <h2>My tip jar</h2>
        <p className="muted">Connect your wallet to get your tip jar address and shareable link.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>My tip jar</h2>
      <p className="muted">Share your address or link so others can send you tips with messages.</p>

      <div className="jar-block">
        <label className="label">Your Bitcoin address</label>
        <div className="row">
          <code className="address-block">{address}</code>
          <button type="button" className="btn btn-ghost" onClick={copyAddress}>
            {lastCopied === 'address' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="jar-block">
        <label className="label">Shareable link (Send tip page with your address)</label>
        <div className="row">
          <code className="address-block url-block">{jarUrl}</code>
          <button type="button" className="btn btn-ghost" onClick={copyLink}>
            {lastCopied === 'link' ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {jarUrl && (
        <div className="jar-block">
          <label className="label">QR code for your shareable link</label>
          <div className="row qr-row">
            <div className="qr-wrapper">
              <img
                className="qr-image"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  jarUrl,
                )}`}
                alt="QR code for your tip jar link"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
