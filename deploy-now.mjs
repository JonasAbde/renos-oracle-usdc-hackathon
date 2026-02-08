import { ethers } from 'ethers';
import fs from 'fs';

// Hardcode for now (gitignored anyway)
const PRIVATE_KEY = '0xeb7d31a9b00ab36bbda0b0e19cff11d0d25b4f449084ba40c4b80f89ab99c42d';
const RPCS = [
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.drpc.org',
  'https://cloudflare-eth.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://1rpc.io/eth'
];

const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function tryDeploy(rpcUrl) {
  try {
    console.log(`\n🔍 ${rpcUrl.slice(8, 40)}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   💰 ${ethers.formatEther(balance)} ETH`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.005) {
      console.log('   ❌ Too low');
      return null;
    }
    
    console.log('   ⚡ Estimating gas...');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const deployTx = factory.getDeployTransaction(USDC_MAINNET);
    const gasEstimate = await provider.estimateGas(deployTx);
    console.log(`   ✅ ${gasEstimate.toString()} gas`);
    
    console.log('   🚀 DEPLOYING...');
    const contract = await factory.deploy(USDC_MAINNET);
    console.log(`   ⏳ ${contract.deploymentTransaction().hash.slice(0, 20)}...`);
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`\n🔥 SUCCESS!`);
    console.log(`📍 ${address}`);
    console.log(`🔗 https://etherscan.io/address/${address}`);
    
    const deployment = {
      network: 'ethereum-mainnet',
      contractAddress: address,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      txHash: contract.deploymentTransaction().hash,
      rpc: rpcUrl,
      etherscan: `https://etherscan.io/address/${address}`
    };
    
    fs.writeFileSync('./deployment-mainnet.json', JSON.stringify(deployment, null, 2));
    return deployment;
  } catch (err) {
    console.log(`   ❌ ${err.code || err.message.slice(0, 50)}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Trying public RPCs...\n');
  
  for (const rpc of RPCS) {
    const result = await tryDeploy(rpc);
    if (result) return result;
  }
  
  console.log('\n💔 All RPCs blocked. Need premium RPC.');
}

main().catch(console.error);
