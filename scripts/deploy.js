import hre from "hardhat";

async function main() {
  const USDC_BASE_SEPOLIA = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
  
  console.log("🚀 Deploying RenOsOracle...");
  console.log("USDC Contract:", USDC_BASE_SEPOLIA);
  
  const RenOsOracle = await hre.ethers.getContractFactory("RenOsOracle");
  const oracle = await RenOsOracle.deploy(USDC_BASE_SEPOLIA);
  
  await oracle.waitForDeployment();
  const address = await oracle.getAddress();
  
  console.log("\n✅ RenOsOracle deployed!");
  console.log("📍 Address:", address);
  console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${address}`);
  console.log("\n📝 Update .env: CONTRACT_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
