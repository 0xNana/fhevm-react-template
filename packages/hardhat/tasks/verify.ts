import { task } from "hardhat/config";

task("verify:fhevm", "Verify FHEVM contracts with proper configuration")
  .addParam("address", "The contract address to verify")
  .addOptionalParam("constructorArgs", "Constructor arguments (if any)", "")
  .setAction(async (taskArgs, hre) => {
    const { address, constructorArgs } = taskArgs;
    
    console.log(`Verifying FHEVM contract at address: ${address}`);
    
    try {
      const constructorArguments = constructorArgs ? JSON.parse(constructorArgs) : [];
      
      await hre.run("verify:verify", {
        address: address,
        network: hre.network.name,
        constructorArguments: constructorArguments,
      });
      
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      console.error("❌ Verification failed:", error.message);
      
      if (error.message.includes("bytecode")) {
        console.log("\n🔍 Bytecode mismatch detected. This is common with FHEVM contracts due to:");
        console.log("1. Network-specific configuration in SepoliaConfig");
        console.log("2. FHEVM library dependencies");
        console.log("\n💡 Try manual verification on Etherscan with the exact source code");
      }
    }
  });
