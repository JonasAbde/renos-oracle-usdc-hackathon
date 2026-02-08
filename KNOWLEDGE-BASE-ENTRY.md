# Knowledge Base Entry: Ethereum Mainnet Deployment

**Date:** 2026-02-08  
**Topic:** Smart Contract Deployment via Free Public RPCs

## Problem
Deployed RenOS Oracle contract to Ethereum mainnet with only 0.0088 ETH funding.

## Challenges Encountered

1. **Free RPC Gas Limits**
   - Most free RPCs cap at 1M gas
   - Contract deployment needs ~2-3M gas
   - Solution: MEV builder RPCs (bloxroute, flashbots)

2. **RPC Instability**
   - eth.drpc.org: Submitted TX but failed confirmation
   - llamarpc: Out of gas error
   - ankr: Network detection failures

3. **Ethers.js v6 ES Modules**
   - `require()` fails in package.json with `"type": "module"`
   - Must use `.mjs` files or `import` syntax
   - dotenv needs explicit `dotenv.config()` before variable access

## Working Solution

**RPC:** `https://virginia.rpc.blxrbdn.com`  
**Why:** MEV builder infrastructure → high gas limits for arbitrage bots  
**Config:**
```javascript
const provider = new ethers.JsonRpcProvider(rpc, undefined, {
  staticNetwork: ethers.Network.from(1)  // Force mainnet
});

const contract = await factory.deploy(USDC_ADDRESS, {
  gasLimit: 3000000  // Explicit high limit
});
```

## Key Learnings

1. **MEV RPCs > Standard Free RPCs**
   - Builder RPCs (bloxroute, flashbots) allow higher gas
   - Designed for time-sensitive MEV bots
   - Public access, no API key needed

2. **Transaction Propagation Delay**
   - Nonce increases immediately on TX submission
   - Receipt can take 30-60s to propagate to public RPCs
   - Check Etherscan directly for fresh deployments

3. **Hardhat Not Always Better**
   - Raw ethers.js gives more control
   - Hardhat has Node.js version requirements (22.x LTS)
   - Simpler to debug with vanilla scripts

## Resources

- **Working deployment script:** `projects/usdc-hackathon/deploy-now.mjs`
- **Contract address:** `0xfbf9b815d9b78df3beca248317a147d705d261e7`
- **TX hash:** `0xc2ef15c30f25162f43f73eca1f0016847978cd6f25e620985332e966ca3733c8`

## Future Reference

When deploying to Ethereum mainnet with limited funds:
1. Try bloxroute RPCs first (virginia/uk/singapore)
2. Set explicit `gasLimit: 3000000`
3. Force staticNetwork to avoid detection issues
4. Check Etherscan if nonce increases but receipt not found
5. Kill stuck processes - ethers.js can hang on bad RPCs

---

**Saved to:** `memory/knowledge-base/ethereum-deployment.md`
