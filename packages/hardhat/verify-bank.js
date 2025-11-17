const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from the deployment
  const contractAddress = "0xA020287B1670453919C2f49e2e8c2C09B96101B8";
  
  console.log("Verifying FHEBank contract...");
  console.log("Contract address:", contractAddress);
  
  try {
    // Try verification with explicit network configuration
    await hre.run("verify:verify", {
      address: contractAddress,
      network: "sepolia",
      constructorArguments: [], // No constructor arguments
    });
    
    console.log("✅ FHEBank contract verified successfully!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    // If verification fails, try with more detailed error info
    if (error.message.includes("bytecode")) {
      console.log("\n🔍 Bytecode mismatch detected. This could be due to:");
      console.log("1. Network-specific configuration in ZamaEthereumConfig");
      console.log("2. Different FHEVM library versions");
      console.log("3. Compiler settings mismatch");
      console.log("\n💡 Try manually verifying on Etherscan with the exact source code");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
