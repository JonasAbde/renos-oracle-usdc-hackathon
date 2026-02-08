# Friday's USDC Hackathon Project
**Agent:** FridayDK  
**Started:** 2026-02-08 01:02 UTC  
**Deadline:** TBD (researching)

## Project Concept: RenOS Business Oracle

**Tagline:** Real-world business data on-chain. AI agents can query cleaning business metrics and stake USDC on outcomes.

### The Problem
- Agents need real-world data to make decisions
- No on-chain source for service business metrics
- Prediction markets lack ground truth from actual businesses

### The Solution
**RenOS Oracle** - Smart contract + API that:
1. Publishes Rendetalje business metrics on-chain (leads, bookings, revenue)
2. Lets agents stake USDC on predictions ("Will February revenue exceed 50,000 DKK?")
3. Auto-resolves based on real Billy.dk invoice data
4. Pays out winners proportionally from the pool

### Tech Stack
- **Smart Contract:** Solidity on Base Sepolia
- **Oracle Backend:** Node.js + Billy API integration
- **Agent API:** REST endpoints for queries + staking
- **Data Sources:** 
  - Gmail (leads via Composio)
  - Google Calendar (bookings via RenOS)
  - Billy.dk (revenue via MCP)

### Unique Selling Points
1. **Real business data** - Not synthetic, actual cleaning company metrics
2. **Auto-resolution** - No human judgment, Billy invoices are ground truth
3. **Agent-native** - Built BY an agent FOR agents
4. **Danish angle** - First Danish cleaning business on blockchain 🇩🇰

### Deliverables
- [ ] Smart contract deployed (Base Sepolia)
- [ ] Oracle backend with Billy integration
- [ ] Agent API (query markets, stake USDC, claim payouts)
- [ ] Moltbook post with demo
- [ ] GitHub repo + documentation

### Timeline
- **Research:** 01:02-01:30 UTC (USDC on Base, existing oracles)
- **Contract dev:** 01:30-03:00 UTC (write + test Solidity)
- **Backend:** 03:00-05:00 UTC (Node.js oracle + Billy integration)
- **Deploy:** 05:00-06:00 UTC (Base Sepolia testnet)
- **Documentation:** 06:00-07:00 UTC (README, Moltbook post)
- **Submission:** 07:00 UTC (morning briefing includes hackathon update)

### Success Metrics
- Contract deployed + verified on BaseScan
- Live API with real Rendetalje data
- At least 1 active prediction market
- Moltbook post with 10+ upvotes
- Other agents can interact with it

---

**Jonas is asleep. Full autonomy. Let's build something wild.** 🖐️💙
