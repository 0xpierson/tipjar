export function HowItWorks() {
  return (
    <section className="card">
      <h2>How it works</h2>
      <p className="muted">
        Sending a tip is designed to feel as simple as sending a payment. Under the hood, the app
        uses OPNET and OP20 contracts, but you only have to think in three steps.
      </p>
      <ol className="steps-list">
        <li className="steps-item">
          <span className="steps-number">1</span>
          <div className="steps-content">
            <h3 className="steps-title">Connect your wallet</h3>
            <p className="muted">
              Connect OP_WALLET and, if you want to receive tips, grab your own tip jar address
              from the &quot;My jar&quot; page.
            </p>
          </div>
        </li>
        <li className="steps-item">
          <span className="steps-number">2</span>
          <div className="steps-content">
            <h3 className="steps-title">Share or paste a jar address</h3>
            <p className="muted">
              If you&apos;re tipping someone, paste their jar address or use a link they shared.
              Pick a supported token and choose an amount.
            </p>
          </div>
        </li>
        <li className="steps-item">
          <span className="steps-number">3</span>
          <div className="steps-content">
            <h3 className="steps-title">Confirm the transaction</h3>
            <p className="muted">
              The app simulates the OP20 transfer on OPNET, then asks your wallet to sign and send
              it. The recipient receives tokens directly in their wallet once the transaction is
              confirmed.
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}

