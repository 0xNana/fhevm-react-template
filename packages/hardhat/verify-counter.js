const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from the deployment
  const contractAddress = "0xaD920A4E9ACD84aA5F094e128b0d811eDB12F57F";
  
  console.log("Verifying FHECounter contract...");
  console.log("Contract address:", contractAddress);
  
  try {
    // Try verification with explicit network configuration
    await hre.run("verify:verify", {
      address: contractAddress,
      network: "sepolia",
      constructorArguments: [], // No constructor arguments
    });
    
    console.log("✅ FHECounter contract verified successfully!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    // If verification fails, try with more detailed error info
    if (error.message.includes("bytecode")) {
      console.log("\n🔍 Bytecode mismatch detected. This could be due to:");
      console.log("1. Network-specific configuration in SepoliaConfig");
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
