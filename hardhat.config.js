export default {
  solidity: "0.8.23",
  networks: {
    mainnet: {
      url: "https://cloudflare-eth.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000,
      gasPrice: "auto"
    }
  }
};
