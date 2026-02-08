export default {
  solidity: "0.8.23",
  networks: {
    mainnet: {
      url: "https://cloudflare-eth.com",
      accounts: ["0xeb7d31a9b00ab36bbda0b0e19cff11d0d25b4f449084ba40c4b80f89ab99c42d"],
      timeout: 120000,
      gasPrice: "auto"
    }
  }
};
