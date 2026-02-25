import { Link } from 'react-router-dom';

export function Home() {
  return (
    <section className="hero">
      <h1 className="hero-title">Send token tips on OPNET</h1>
      <p className="hero-subtitle">
        Support creators with seamless OP20 token tips that move your favorite assets directly to
        their wallet, with no custodians or complicated dashboards.
      </p>
      <div className="hero-actions">
        <Link to="/send" className="btn btn-primary btn-lg">
          Send a tip
        </Link>
        <Link to="/jar" className="btn btn-secondary btn-lg">
          My tip jar
        </Link>
      </div>
    </section>
  );
}
