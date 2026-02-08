const ethers = require('ethers');

const WALLET = '0x6C6A5255353636D3fb2f1d662522B570047Bc074';
const RPC = 'https://eth.llamarpc.com'; // Free Ethereum mainnet RPC

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const balance = await provider.getBalance(WALLET);
  const ethBalance = ethers.formatEther(balance);
  
  console.log(`Balance: ${ethBalance} ETH`);
  
  if (parseFloat(ethBalance) > 0) {
    console.log('🔥 FUNDS RECEIVED! Ready to deploy!');
    return true;
  } else {
    console.log('⏳ Waiting for funds...');
    return false;
  }
}

checkBalance().catch(console.error);
