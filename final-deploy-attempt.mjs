import { ethers } from 'ethers';
import fs from 'fs';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// HIGH GAS LIMIT RPCs (paid tier features on free tier)
const PREMIUM_RPCS = [
  'https://rpc.builder0x69.io',          // MEV builder RPC (high limits)
  'https://rpc.payload.de',               // German RPC (generous)
  'https://virginia.rpc.blxrbdn.com',    // bloxroute (MEV)
  'https://uk.rpc.blxrbdn.com',          // bloxroute UK
  'https://singapore.rpc.blxrbdn.com'    // bloxroute SG
];

const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RenOsOracle.sol/RenOsOracle.json', 'utf8'));
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function tryDeploy(rpcUrl) {
  try {
    console.log(`\n🔍 ${rpcUrl.slice(8, 50)}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: ethers.Network.from(1)  // Force Ethereum mainnet
    });
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   💰 ${ethers.formatEther(balance)} ETH`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.005) {
      console.log('   ❌ Low balance');
      return null;
    }
    
    console.log('   ⚡ Estimating gas...');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    // Deploy with explicit gas settings
    console.log('   🚀 Deploying...');
    const contract = await factory.deploy(USDC_MAINNET, {
      gasLimit: 3000000  // Explicit high limit
    });
    
    console.log(`   ⏳ ${contract.deploymentTransaction().hash}`);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`\n🔥 SUCCESS: ${address}`);
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
    console.log(`   ❌ ${err.code || err.message.slice(0, 60)}`);
    return null;
  }
}

console.log('🚀 Trying MEV/Builder RPCs (high gas limits)...\n');

for (const rpc of PREMIUM_RPCS) {
  const result = await tryDeploy(rpc);
  if (result) {
    console.log('\n✅ DEPLOYMENT COMPLETE!');
    process.exit(0);
  }
}

console.log('\n💔 All attempts failed.');
