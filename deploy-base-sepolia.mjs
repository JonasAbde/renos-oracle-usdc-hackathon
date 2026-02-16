import { ethers } from 'ethers';
import fs from 'fs';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC = 'https://sepolia.base.org';  // Official Base Sepolia RPC
const USDC_BASE_SEPOLIA = '0x036cbd53842c5426634e7929541ec2318f3dcf7e';

const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));

async function deploy() {
  console.log('🚀 Deploying to BASE SEPOLIA (testnet)...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📍 Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (parseFloat(ethers.formatEther(balance)) === 0) {
    console.log('\n⚠️  Need testnet ETH!');
    console.log(`🔗 Get free ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`);
    console.log(`📍 Send to: ${wallet.address}`);
    return;
  }
  
  console.log('\n⚡ Deploying contract...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(USDC_BASE_SEPOLIA);
  
  console.log(`⏳ TX: ${contract.deploymentTransaction().hash}`);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  
  console.log('\n🔥 CONTRACT DEPLOYED!');
  console.log(`📍 Address: ${address}`);
  console.log(`🔗 BaseScan: https://sepolia.basescan.org/address/${address}`);
  console.log(`🔗 Tx: https://sepolia.basescan.org/tx/${contract.deploymentTransaction().hash}`);
  
  const deployment = {
    network: 'base-sepolia',
    contractAddress: address,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash,
    basescan: `https://sepolia.basescan.org/address/${address}`,
    usdcAddress: USDC_BASE_SEPOLIA
  };
  
  fs.writeFileSync('./deployment-base-sepolia.json', JSON.stringify(deployment, null, 2));
  console.log('\n💾 Saved to deployment-base-sepolia.json');
  
  return deployment;
}

deploy().catch(console.error);
