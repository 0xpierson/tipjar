# OPNet Tip Jar

Bitcoin L1 tip-jar frontend built with OPNet.

This repository currently includes:
- A React + Vite frontend for wallet-connected tipping
- OP20 tip flows for `$PILL`, `$MOTO`, and custom token addresses

## Project Structure

```text
.
├── src/
├── public/
└── dist/ (generated)
```

## Prerequisites

- Node.js 20+ (recommended)
- npm or yarn
- OP_WALLET browser extension

## Local Development

Install and run:

```bash
npm install
npm run dev
```

Default dev server URL:
- `http://localhost:5173`

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - TypeScript build + Vite production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks
- `npm run typecheck` - run TypeScript checks only
- `npm run format` - format source files with Prettier
- `npm run format:check` - check formatting without writing changes

## How Tipping Works

1. Connect wallet with OP_WALLET.
2. Open the **Send tip** page.
3. Enter recipient tip jar address (`opt1...`), select token, and amount.
4. The app simulates the transfer before broadcast.
5. Confirm in wallet; transaction link is shown after success.

## Network and Wallet Notes

- App is currently configured for OPNet testnet RPC (`https://testnet.opnet.org`).
- Frontend transactions use wallet signing (`signer: null`, `mldsaSigner: null`).
- Never put private keys in frontend code.

## Token Configuration

Default OP20 tokens are configured in `src/config.ts`:
- `PILL_TOKEN`
- `MOTO_TOKEN`

Custom token mode is available in the UI by entering:
- Token contract address
- Token decimals

## Notes

- Build output is written to `dist/`.
- If the recipient address cannot be resolved on OPNet testnet, tipping will fail with a validation error.
