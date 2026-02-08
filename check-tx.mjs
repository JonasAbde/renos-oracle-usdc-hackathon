import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://ethereum.publicnode.com');
const wallet = '0x6C6A5255353636D3fb2f1d662522B570047Bc074';

const txCount = await provider.getTransactionCount(wallet);
console.log(`Wallet nonce: ${txCount}`);

if (txCount > 0) {
  console.log('\n✅ Transaction(s) sent from this wallet!');
  console.log(`Check: https://etherscan.io/address/${wallet}`);
} else {
  console.log('\n❌ No transactions yet');
}
