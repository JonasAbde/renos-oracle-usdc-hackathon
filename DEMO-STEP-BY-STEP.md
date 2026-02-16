# RenOS Oracle — Demo (Step-by-step)

This is a practical demo checklist you can run **without guessing**.

## 0) Quick facts
- **Mainnet contract:** `0xfbf9b815d9b78df3beca248317a147d705d261e7`
- **Repo:** https://github.com/JonasAbde/renos-oracle-usdc-hackathon

## 1) Read-only demo (no funds needed)

### A) Install deps
```bash
cd projects/usdc-hackathon
npm install
```

### B) Read marketCount (read-only)
Create a small script (or use node REPL) to call `marketCount()`.
Example:
```js
// scripts/read-market-count.mjs
import { ethers } from "ethers";
import fs from "fs";

const RPC = process.env.RPC_URL || "https://ethereum.publicnode.com";
const CONTRACT_ADDRESS = "0xfbf9b815d9b78df3beca248317a147d705d261e7";
const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json", "utf8"));

const provider = new ethers.JsonRpcProvider(RPC);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, provider);

console.log("marketCount =", (await contract.marketCount()).toString());
```
Run:
```bash
node scripts/read-market-count.mjs
```

## 2) Live demo (creates a real market) — needs wallet access

Creating a market is an **on-chain transaction** (costs a tiny amount of ETH for gas).
For safety: **do NOT paste private keys in Discord**.

### Option A (recommended): run from VPS via SSH with an env var
On the VPS:
```bash
cd /root/.openclaw/workspace/projects/usdc-hackathon
export PRIVATE_KEY='0x...'
node deploy-now.mjs
```

### Option B: run from your own machine
Same command, but you run it locally.

## 3) After market creation
- Verify TX on Etherscan
- Share the TX link + marketId
- (Optional) Stake small USDC from a wallet to show the full end-to-end flow

## Notes
- The contract is intentionally minimal for hackathon clarity.
- If we want broader adoption: add templates + multi-data-source resolution + basic UI.
