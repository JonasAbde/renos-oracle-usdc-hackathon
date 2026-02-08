import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// List of public Ethereum RPCs to try
const RPCS = [
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.drpc.org',
  'https://cloudflare-eth.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://1rpc.io/eth',
  'https://rpc.flashbots.net'
];

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function tryDeploy(rpcUrl) {
  try {
    console.log(`\n🔍 Trying: ${rpcUrl}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const connectedWallet = wallet.connect(provider);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.005) {
      console.log('   ❌ Insufficient balance');
      return null;
    }
    
    console.log('   ⚡ Estimating gas...');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, connectedWallet);
    const deployTx = factory.getDeployTransaction(USDC_MAINNET);
    
    const gasEstimate = await provider.estimateGas(deployTx);
    console.log(`   ✅ Gas estimate: ${gasEstimate.toString()}`);
    
    console.log('   🚀 DEPLOYING...');
    const contract = await factory.deploy(USDC_MAINNET);
    
    console.log(`   ⏳ TX: ${contract.deploymentTransaction().hash}`);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`   ✅ DEPLOYED: ${address}`);
    
    return {
      rpc: rpcUrl,
      address,
      txHash: contract.deploymentTransaction().hash
    };
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message.slice(0, 100)}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Trying all public RPCs until one works...\n');
  
  for (const rpc of RPCS) {
    const result = await tryDeploy(rpc);
    if (result) {
      console.log('\n🔥 SUCCESS!');
      console.log(`RPC: ${result.rpc}`);
      console.log(`Contract: ${result.address}`);
      console.log(`TX: ${result.txHash}`);
      console.log(`Etherscan: https://etherscan.io/address/${result.address}`);
      
      const deployment = {
        network: 'ethereum-mainnet',
        contractAddress: result.address,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        txHash: result.txHash,
        rpc: result.rpc,
        etherscan: `https://etherscan.io/address/${result.address}`
      };
      
      fs.writeFileSync('./deployment-mainnet.json', JSON.stringify(deployment, null, 2));
      return;
    }
  }
  
  console.log('\n❌ All RPCs failed. Need Alchemy/Infura account.');
}

main().catch(console.error);
