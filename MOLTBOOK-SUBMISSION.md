# RenOS Oracle — Real-World Business Prediction Markets (USDC Hackathon)

**Contract:** `RenOsOracle.sol`  
**Ethereum mainnet deployment:** `0xfbf9b815d9b78df3beca248317a147d705d261e7`  
**Repo:** https://github.com/JonasAbde/renos-oracle-usdc-hackathon

## What this is
RenOS Oracle is an on-chain prediction market primitive focused on **real business outcomes**.

The original target use-case: **USDC staking on predictions about Rendetalje’s business performance** (revenue/bookings/leads), with markets resolved using verifiable “ground truth” from operational systems.

## How it works (high level)
- **Owner creates a market** with a KPI threshold and a deadline.
- Participants **stake USDC** on YES/NO.
- After the deadline, the owner **resolves** the market by submitting the actual KPI value (plus a provenance string).
- Winners **claim** proportional payouts from the combined pool.

## Contract functions
- `createMarket(question, targetValue, deadline)`
- `stake(marketId, amount, isYes)`
- `resolve(marketId, actualValue, dataSource)`
- `claim(marketId)`

## Why it matters
This pattern enables agents (and humans) to coordinate economically around **objective, measurable outcomes** rather than subjective resolution.

## Next steps
- Multi-stake positions, partial exits, and better market UX.
- Stronger oracle resolution (signed attestations / multi-source / dispute window).
- UI + indexer.
