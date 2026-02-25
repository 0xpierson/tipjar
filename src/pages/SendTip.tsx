import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Address } from '@btc-vision/transaction';
import { getContract, OP_20_ABI, type IOP20Contract, type TransactionParameters } from 'opnet';
import { useProvider } from '../context/ProviderContext';
import { PILL_TOKEN, MOTO_TOKEN, getOpscanNetworkParam } from '../config';
import { useWallet } from '../hooks/useWallet';

type TipAsset = 'PILL' | 'MOTO' | 'CUSTOM';

const QUICK_AMOUNTS_BTC = ['0.1', '1', '10', '1000'] as const;

function parseAmountToUnits(value: string, decimals: number): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;

  const parts = trimmed.split('.');
  const intPartRaw = parts[0] ?? '';
  const decPartRaw = parts[1] ?? '';
  const intPart = intPartRaw.replace(/\D/g, '') || '0';
  const decDigits = decPartRaw.replace(/\D/g, '');
  const normalizedDec = (decDigits || '0').padEnd(decimals, '0').slice(0, decimals);

  try {
    const base = 10n ** BigInt(decimals);
    return BigInt(intPart) * base + BigInt(normalizedDec);
  } catch {
    return 0n;
  }
}

function formatUnits(value: bigint, decimals: number, displayDecimals: number = 3): string {
  const sign = value < 0n ? '-' : '';
  const abs = value < 0n ? -value : value;
  if (decimals === 0) {
    return `${sign}${abs.toString()}`;
  }
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const fraction = abs % base;
  if (fraction === 0n) {
    return `${sign}${whole.toString()}`;
  }

  const fullFractionStr = fraction.toString().padStart(decimals, '0');
  const visibleDecimals = Math.min(decimals, displayDecimals);
  const visibleFraction = fullFractionStr.slice(0, visibleDecimals);
  const trimmedFraction = visibleFraction.replace(/0+$/, '');

  if (!trimmedFraction) {
    return `${sign}${whole.toString()}`;
  }

  return `${sign}${whole.toString()}.${trimmedFraction}`;
}

function sanitizeBtcInput(value: string): string {
  // Allow only digits and a single dot, limit to 8 decimal places, and preserve a trailing dot while typing
  let cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');

  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  const hasDot = cleaned.includes('.');
  let [intPartRaw, decPartRaw] = cleaned.split('.');
  let intPart = intPartRaw ?? '';
  let decPart = decPartRaw ?? '';

  if (!intPart && hasDot) {
    intPart = '0';
  }

  if (!decPart && hasDot && cleaned.endsWith('.')) {
    return `${intPart}.`;
  }

  const limitedDec = decPart.slice(0, 8);
  return decPart ? `${intPart}.${limitedDec}` : intPart;
}

export function SendTip() {
  const [searchParams] = useSearchParams();
  const jarFromUrl = searchParams.get('to') ?? '';

  const [jarAddress, setJarAddress] = useState(jarFromUrl);
  const [amountStr, setAmountStr] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
  const [asset, setAsset] = useState<TipAsset>('PILL');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenDecimals, setCustomTokenDecimals] = useState('8');

  const { provider, network } = useProvider();
  const { address, hashedMLDSAKey, publicKey, signer, isConnected, walletType } = useWallet();

  const currentToken = useMemo(() => {
    if (asset === 'PILL') {
      return PILL_TOKEN;
    }
    if (asset === 'MOTO') {
      return MOTO_TOKEN;
    }
    return {
      id: 'CUSTOM' as const,
      symbol: 'CUSTOM',
      name: 'Custom token',
      address: customTokenAddress.trim(),
      decimals: Number.parseInt(customTokenDecimals, 10) || 0,
    };
  }, [asset, customTokenAddress, customTokenDecimals]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTokenBalance() {
      if (!address || !hashedMLDSAKey || !publicKey) {
        setTokenBalance(null);
        setTokenDecimals(null);
        return;
      }

      try {
        const tokenAddress = currentToken.address;
        const tokenDecimals = currentToken.decimals;

        if (
          !tokenAddress ||
          !Number.isInteger(tokenDecimals) ||
          tokenDecimals < 0 ||
          tokenDecimals > 18
        ) {
          setTokenBalance(null);
          setTokenDecimals(null);
          return;
        }

        const ownerAddress = Address.fromString(hashedMLDSAKey, publicKey);
        const tokenContract = getContract<IOP20Contract>(
          tokenAddress,
          OP_20_ABI,
          provider,
          network,
          ownerAddress,
        );

        // Always resolve decimals from chain to avoid config mismatch
        const decimalsResult = await tokenContract.decimals();
        const onChainDecimals = decimalsResult.properties.decimals;

        const balanceResult = await tokenContract.balanceOf(ownerAddress);

        if (!cancelled) {
          setTokenBalance(balanceResult.properties.balance);
          setTokenDecimals(onChainDecimals);
        }
      } catch (err) {
        if (!cancelled) {
          setTokenBalance(null);
          setTokenDecimals(null);
          // eslint-disable-next-line no-console
          console.error('Failed to fetch token balance', err);
        }
      }
    }

    fetchTokenBalance();

    return () => {
      cancelled = true;
    };
  }, [address, hashedMLDSAKey, publicKey, provider, network, currentToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log('[tipjar] handleSubmit wallet state', {
      address,
      isConnected,
      hasSigner: Boolean(signer),
      walletType,
    });
    // eslint-disable-next-line no-console
    console.log('[tipjar] provider network', network);

    if (!isConnected || !address) {
      setErrorMsg('Connect your wallet first.');
      setStatus('error');
      return;
    }
    if (!jarAddress.trim()) {
      setErrorMsg('Enter the tip jar address.');
      setStatus('error');
      return;
    }
    if (!amountStr.trim()) {
      setErrorMsg('Enter an amount to tip.');
      setStatus('error');
      return;
    }

    // Token path (PILL, MOTO, or custom OP20)
    setErrorMsg(null);
    setStatus('sending');

    try {
      const tokenAddress = currentToken.address;
      const configDecimals = currentToken.decimals;
      const decimalsToUse =
        tokenDecimals !== null && Number.isInteger(tokenDecimals) && tokenDecimals >= 0
          ? tokenDecimals
          : configDecimals;

      if (!tokenAddress) {
        throw new Error('Token address is not configured. Please set it in environment/config.');
      }

      if (!Number.isInteger(decimalsToUse) || decimalsToUse < 0 || decimalsToUse > 18) {
        throw new Error('Invalid token decimals configuration.');
      }

      const amountUnits = parseAmountToUnits(amountStr, decimalsToUse);
      if (amountUnits <= 0n) {
        throw new Error('Token amount must be greater than 0.');
      }

      if (tokenBalance !== null && amountUnits > tokenBalance) {
        throw new Error('Token amount exceeds available balance.');
      }

      // Resolve OPNET Address objects for sender and recipient from Bitcoin addresses
      if (!hashedMLDSAKey || !publicKey) {
        throw new Error('Wallet public key information is not available. Please reconnect your wallet.');
      }
      const senderAddress = Address.fromString(hashedMLDSAKey, publicKey);
      const trimmedJar = jarAddress.trim();

      let recipientAddress;
      try {
        recipientAddress = await provider.getPublicKeyInfo(trimmedJar, true);
        if (!recipientAddress) {
          throw new Error(
            'Could not resolve the tip jar address to an OPNet Address. Make sure this address exists on opnetTestnet and has on-chain activity, then try again.',
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('No valid address content found')) {
          throw new Error(
            'Tip jar address is not valid on OPNet testnet. Please use a valid opt1... address created on opnetTestnet.',
          );
        }
        throw err;
      }

      const tokenContract = getContract<IOP20Contract>(
        tokenAddress,
        OP_20_ABI,
        provider,
        network,
        senderAddress,
      );

      const simulation = await tokenContract.transfer(recipientAddress, amountUnits);

      if (simulation.revert) {
        throw new Error(`Transfer would fail: ${simulation.revert}`);
      }

      const txParams: TransactionParameters = {
        signer: null,
        mldsaSigner: null,
        refundTo: address,
        maximumAllowedSatToSpend: 100_000n,
        feeRate: 0,
        network,
      };

      const receipt = await simulation.sendTransaction(txParams);

      if ('revert' in receipt && receipt.revert) {
        throw new Error(`Transaction reverted: ${receipt.revert}`);
      }

      setTxId(receipt.transactionId ?? null);
      setStatus('done');
      setAmountStr('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Send failed';
      // eslint-disable-next-line no-console
      console.error('[tipjar] handleSubmit token error', message);
      setErrorMsg(message);
      setStatus('error');
    }
  };

  if (!isConnected) {
    return (
      <section className="card">
        <h2>Send a tip</h2>
        <p className="muted">
          Connect your wallet to send a tip with OP20 tokens.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Send a tip</h2>
      <p className="muted">
        Enter the tip jar address and token amount.
      </p>

      {status === 'done' && txId && (
        <div className="alert alert-success">
          <strong>Tip sent!</strong>
          <div>
            Tx: <code className="tx-id">{txId}</code>
          </div>
          <div>
            View on{' '}
            <a
              href={`https://opscan.org/transactions/${txId}?network=op_testnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'orange' }}
            >
              OPScan
            </a>
          </div>
        </div>
      )}
      {status === 'error' && errorMsg && (
        <div className="alert alert-error">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          Asset
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className={
                asset === 'PILL' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'
              }
              onClick={() => setAsset('PILL')}
              disabled={status === 'sending'}
            >
              $PILL
            </button>
            <button
              type="button"
              className={
                asset === 'MOTO' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'
              }
              onClick={() => setAsset('MOTO')}
              disabled={status === 'sending'}
            >
              $MOTO
            </button>
            <button
              type="button"
              className={
                asset === 'CUSTOM' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'
              }
              onClick={() => setAsset('CUSTOM')}
              disabled={status === 'sending'}
            >
              Custom token
            </button>
          </div>
        </label>
        {asset === 'CUSTOM' && (
          <>
            <label className="label">
              Custom token contract address
              <input
                type="text"
                className="input"
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value)}
                placeholder="opt1p... or 0x..."
                disabled={status === 'sending'}
              />
            </label>
            <label className="label">
              Custom token decimals
              <input
                type="number"
                className="input"
                value={customTokenDecimals}
                onChange={(e) => setCustomTokenDecimals(e.target.value)}
                min={0}
                max={18}
                disabled={status === 'sending'}
              />
            </label>
          </>
        )}
        <label className="label">
          Tip jar address (recipient)
          <input
            type="text"
            className="input"
            value={jarAddress}
            onChange={(e) => setJarAddress(e.target.value)}
            placeholder="opt1p..."
            disabled={status === 'sending'}
          />
        </label>
        <label className="label">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.25rem',
            }}
          >
            <span>
              Amount ({currentToken.symbol})
            </span>
            {tokenBalance !== null && (
              <span className="muted" style={{ marginBottom: '0' }}>
                Balance:{' '}
                {formatUnits(
                  tokenBalance,
                  tokenDecimals !== null ? tokenDecimals : currentToken.decimals,
                )}{' '}
                {currentToken.symbol}
              </span>
            )}
          </div>
          <input
            type="text"
            className="input"
            value={amountStr}
            onChange={(e) => setAmountStr(sanitizeBtcInput(e.target.value))}
            placeholder="e.g. 10"
            disabled={status === 'sending'}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            {QUICK_AMOUNTS_BTC.map((val) => (
              <button
                key={val}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAmountStr(val)}
                disabled={status === 'sending'}
              >
                {val}
              </button>
            ))}
          </div>
          {(() => {
            const decimalsForUi =
              tokenDecimals !== null && Number.isInteger(tokenDecimals) && tokenDecimals >= 0
                ? tokenDecimals
                : currentToken.decimals;
            const safeDecimalsForUi =
              Number.isInteger(decimalsForUi) && decimalsForUi >= 0 && decimalsForUi <= 18
                ? decimalsForUi
                : null;
            const parsedAmountUnits =
              safeDecimalsForUi !== null && amountStr.trim()
                ? parseAmountToUnits(amountStr, safeDecimalsForUi)
                : 0n;
            const exceedsBalance =
              tokenBalance !== null &&
              safeDecimalsForUi !== null &&
              parsedAmountUnits > tokenBalance;

            if (!exceedsBalance) {
              return null;
            }

            return (
              <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>
                Amount exceeds available balance.
              </div>
            );
          })()}
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={(() => {
            if (status === 'sending' || !amountStr.trim()) {
              return true;
            }

            const decimalsForUi =
              tokenDecimals !== null && Number.isInteger(tokenDecimals) && tokenDecimals >= 0
                ? tokenDecimals
                : currentToken.decimals;
            const safeDecimalsForUi =
              Number.isInteger(decimalsForUi) && decimalsForUi >= 0 && decimalsForUi <= 18
                ? decimalsForUi
                : null;
            const parsedAmountUnits =
              safeDecimalsForUi !== null && amountStr.trim()
                ? parseAmountToUnits(amountStr, safeDecimalsForUi)
                : 0n;

            return (
              tokenBalance !== null &&
              safeDecimalsForUi !== null &&
              parsedAmountUnits > tokenBalance
            );
          })()}
        >
          {status === 'sending' ? 'Sending…' : 'Send tip'}
        </button>
      </form>
    </section>
  );
}
