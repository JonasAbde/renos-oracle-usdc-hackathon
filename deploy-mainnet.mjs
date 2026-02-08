import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function deploy() {
  console.log('🚀 Deploying RenOS Oracle to Ethereum Mainnet...');
  console.log(`Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (parseFloat(ethers.formatEther(balance)) < 0.005) {
    console.log('❌ Insufficient balance. Waiting for funds...');
    return null;
  }
  
  console.log('✅ Sufficient balance! Deploying...');
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(USDC_MAINNET);
  
  console.log(`⏳ Deployment transaction: ${contract.deploymentTransaction().hash}`);
  console.log('⏳ Waiting for confirmation...');
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log('✅ CONTRACT DEPLOYED!');
  console.log(`📍 Address: ${address}`);
  console.log(`🔗 Etherscan: https://etherscan.io/address/${address}`);
  
  const deployment = {
    network: 'ethereum-mainnet',
    contractAddress: address,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash,
    etherscan: `https://etherscan.io/address/${address}`
  };
  
  fs.writeFileSync('./deployment-mainnet.json', JSON.stringify(deployment, null, 2));
  console.log('💾 Saved to deployment-mainnet.json');
  
  return deployment;
}

deploy().catch(console.error);
