#!/usr/bin/env node
/**
 * RenOS Oracle Backend
 * Fetches real Rendetalje data and provides API for agents
 */

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Will be generated
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // After deployment

// Billy.dk integration (using existing MCP client)
const billyClient = require('../../../skills/billy-invoice/billy-client.js');

// Calendar integration (using existing Composio client)
const { listEvents } = require('../../../skills/composio-calendar/mcp-client.js');

/**
 * Get current month revenue from Billy.dk
 */
async function getBillyRevenue(month, year) {
  try {
    // Query Billy for invoices in given month
    const invoices = await billyClient.getInvoices({
      fromDate: `${year}-${month.toString().padStart(2, '0')}-01`,
      toDate: `${year}-${month.toString().padStart(2, '0')}-28`
    });
    
    const total = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    return Math.round(total * 100); // Convert to cents
  } catch (err) {
    console.error('Billy revenue fetch failed:', err);
    return 0;
  }
}

/**
 * Get booking count from RenOS Calendar
 */
async function getBookingCount(month, year) {
  try {
    const events = await listEvents({
      calendarId: 'c_39570a852bf141658572fa37bb229c7246564a6cca47560bc66a4f9e4fec67ff@group.calendar.google.com',
      account: 'rendetalje',
      timeMin: `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`,
      timeMax: `${year}-${month.toString().padStart(2, '0')}-28T23:59:59Z`
    });
    return events.length;
  } catch (err) {
    console.error('Calendar fetch failed:', err);
    return 0;
  }
}

// API Routes

/**
 * GET /api/metrics/current
 * Returns current month business metrics
 */
app.get('/api/metrics/current', async (req, res) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const [revenue, bookings] = await Promise.all([
    getBillyRevenue(month, year),
    getBookingCount(month, year)
  ]);
  
  res.json({
    month,
    year,
    revenue_dkk_cents: revenue,
    booking_count: bookings,
    last_updated: now.toISOString()
  });
});

/**
 * GET /api/markets
 * List all prediction markets
 */
app.get('/api/markets', async (req, res) => {
  if (!CONTRACT_ADDRESS) {
    return res.json({ markets: [], error: 'Contract not deployed yet' });
  }
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ['function marketCount() view returns (uint256)', 'function getMarket(uint256) view returns (string,uint256,uint256,uint256,uint256,uint8,uint8,uint256)'],
      provider
    );
    
    const count = await contract.marketCount();
    const markets = [];
    
    for (let i = 0; i < count; i++) {
      const market = await contract.getMarket(i);
      markets.push({
        id: i,
        question: market[0],
        targetValue: market[1].toString(),
        deadline: Number(market[2]),
        yesPool: market[3].toString(),
        noPool: market[4].toString(),
        status: market[5],
        outcome: market[6],
        actualValue: market[7].toString()
      });
    }
    
    res.json({ markets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/markets/:id/resolve
 * Admin endpoint: Resolve market with real data
 */
app.post('/api/markets/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { admin_key } = req.body;
  
  // Simple auth check
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Fetch real data from Billy
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const revenue = await getBillyRevenue(month, year);
    
    // Resolve on-chain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ['function resolve(uint256,uint256,string) external'],
      wallet
    );
    
    const dataSource = `Billy.dk revenue ${year}-${month.toString().padStart(2, '0')}`;
    const tx = await contract.resolve(id, revenue, dataSource);
    await tx.wait();
    
    res.json({
      success: true,
      actualValue: revenue,
      dataSource,
      txHash: tx.hash
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    contract: CONTRACT_ADDRESS || 'not deployed'
  });
});

app.listen(PORT, () => {
  console.log(`🦞 RenOS Oracle API running on port ${PORT}`);
  console.log(`📊 Real-time Rendetalje data available`);
  console.log(`🔗 Contract: ${CONTRACT_ADDRESS || 'not deployed yet'}`);
});
