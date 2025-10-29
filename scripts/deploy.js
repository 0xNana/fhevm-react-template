"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    console.log("🚀 Deploying Cloak SDK Example Contracts...");
    // Get the deployer account
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
    // Deploy FHECounter
    console.log("\n📊 Deploying FHECounter...");
    const FHECounter = await hardhat_1.ethers.getContractFactory("FHECounter");
    const fheCounter = await FHECounter.deploy();
    await fheCounter.waitForDeployment();
    const fheCounterAddress = await fheCounter.getAddress();
    console.log("FHECounter deployed to:", fheCounterAddress);
    // Deploy FHEVoting
    console.log("\n🗳️ Deploying FHEVoting...");
    const FHEVoting = await hardhat_1.ethers.getContractFactory("FHEVoting");
    const fheVoting = await FHEVoting.deploy();
    await fheVoting.waitForDeployment();
    const fheVotingAddress = await fheVoting.getAddress();
    console.log("FHEVoting deployed to:", fheVotingAddress);
    // Deploy FHEBank
    console.log("\n🏦 Deploying FHEBank...");
    const FHEBank = await hardhat_1.ethers.getContractFactory("FHEBank");
    const fheBank = await FHEBank.deploy();
    await fheBank.waitForDeployment();
    const fheBankAddress = await fheBank.getAddress();
    console.log("FHEBank deployed to:", fheBankAddress);
    // Create a voting session
    console.log("\n📝 Creating a sample voting session...");
    const tx = await fheVoting.createVotingSession("Sample Proposal", "This is a sample proposal for testing the FHEVoting contract", 3600 // 1 hour duration
    );
    await tx.wait();
    console.log("Sample voting session created with ID: 0");
    // Save deployment info
    const deploymentInfo = {
        network: "hardhat",
        chainId: 31337,
        deployer: deployer.address,
        contracts: {
            FHECounter: {
                address: fheCounterAddress,
                abi: FHECounter.interface.format("json")
            },
            FHEVoting: {
                address: fheVotingAddress,
                abi: FHEVoting.interface.format("json")
            },
            FHEBank: {
                address: fheBankAddress,
                abi: FHEBank.interface.format("json")
            }
        },
        deployedAt: new Date().toISOString()
    };
    // Write deployment info to file
    const fs = require("fs");
    const path = require("path");
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(deploymentsDir, "hardhat-deployment.json"), JSON.stringify(deploymentInfo, null, 2));
    console.log("\n✅ Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("  FHECounter:", fheCounterAddress);
    console.log("  FHEVoting:", fheVotingAddress);
    console.log("  FHEBank:", fheBankAddress);
    console.log("\n📁 Deployment info saved to: deployments/hardhat-deployment.json");
    console.log("\n🔗 Next steps:");
    console.log("  1. Copy the contract addresses to your frontend");
    console.log("  2. Use the Cloak SDK to interact with these contracts");
    console.log("  3. Check out the examples in the examples/ directory");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
