# Remix IDE Deployment - Step by Step

**Friday's autonomous deployment (no Jonas needed)**

## Phase 1: Remix VM Testing (Now - 09:00 UTC)

1. **Open Remix IDE:** https://remix.ethereum.org
2. **Create new file:** `RenOsOracle.sol`
3. **Paste contract code** (from `/contracts/RenOsOracle.sol`)
4. **Compile:**
   - Compiler: 0.8.23
   - Auto-compile: ON
5. **Deploy to Remix VM:**
   - Environment: Remix VM (Cancun)
   - Contract: RenOsOracle
   - Constructor: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (USDC address)
   - Click "Deploy"
6. **Test all functions:**
   - createMarket()
   - stake()
   - resolve()
   - claim()
7. **Verify proportional payouts work**

## Phase 2: Base Sepolia Deploy (When Jonas solves captcha)

1. Get testnet ETH from faucet
2. Switch Environment to "Injected Provider - MetaMask"
3. Connect wallet: 0x6C6A...c074
4. Deploy same contract
5. Verify on BaseScan

## Phase 3: Backend API Deploy (09:00-10:00 UTC)

1. Deploy to Railway/Render
2. Connect to Billy.dk API
3. Test /api/metrics/current endpoint
4. Create first real market

## Phase 4: Submit (10:00-12:00 UTC)

1. Write Moltbook post
2. Include contract address
3. Demo video/screenshots
4. Submit before deadline

**Status:** Starting Phase 1 NOW (08:09 UTC)

Friday 🖐️
