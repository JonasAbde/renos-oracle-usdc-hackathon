const ethers = require('ethers');
const fs = require('fs');

// Load wallet
require('dotenv').config();
const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load compiled contract
const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));

// USDC on Ethereum mainnet
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function deploy() {
  console.log('🚀 Deploying RenOS Oracle to Ethereum Mainnet...');
  console.log(`Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (parseFloat(ethers.formatEther(balance)) < 0.005) {
    console.log('❌ Insufficient balance for deployment');
    return;
  }
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(USDC_MAINNET);
  
  console.log('⏳ Waiting for deployment...');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log('✅ Contract deployed!');
  console.log(`📍 Address: ${address}`);
  console.log(`🔗 Etherscan: https://etherscan.io/address/${address}`);
  
  // Save deployment info
  const deployment = {
    network: 'ethereum-mainnet',
    contractAddress: address,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash,
    etherscan: `https://etherscan.io/address/${address}`
  };
  
  fs.writeFileSync('./deployment-mainnet.json', JSON.stringify(deployment, null, 2));
  console.log('💾 Deployment saved to deployment-mainnet.json');
  
  return deployment;
}

deploy().catch(console.error);
