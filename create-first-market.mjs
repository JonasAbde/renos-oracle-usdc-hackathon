import { ethers } from 'ethers';
import fs from 'fs';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC = 'https://ethereum.publicnode.com';
const CONTRACT_ADDRESS = '0xfbf9b815d9b78df3beca248317a147d705d261e7';

const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));

async function createMarket() {
  console.log('🎯 Creating first prediction market...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
  
  // Market: "Will Rendetalje hit 50,000 DKK revenue in February 2026?"
  const question = "Will Rendetalje hit 50,000 DKK revenue in February 2026?";
  const targetValue = ethers.parseUnits('50000', 6); // 50,000 USDC (6 decimals)
  const deadline = Math.floor(new Date('2026-03-01T00:00:00Z').getTime() / 1000);
  
  console.log('Market question:', question);
  console.log('Target value:', '50,000 DKK (as USDC)');
  console.log('Deadline:', new Date(deadline * 1000).toISOString());
  console.log('');
  
  console.log('⚡ Creating market...');
  const tx = await contract.createMarket(question, targetValue, deadline, {
    gasLimit: 300000
  });
  
  console.log('⏳ TX:', tx.hash);
  const receipt = await tx.wait();
  
  console.log('✅ Market created!');
  console.log('Block:', receipt.blockNumber);
  console.log('Gas used:', receipt.gasUsed.toString());
  
  // Get market count
  const count = await contract.marketCount();
  const marketId = Number(count) - 1;
  
  console.log('\n🎯 Market ID:', marketId);
  console.log('📊 Total markets:', count.toString());
  console.log('\n🔗 Etherscan:', `https://etherscan.io/tx/${tx.hash}`);
  
  return { marketId, txHash: tx.hash };
}

createMarket().catch(console.error);
