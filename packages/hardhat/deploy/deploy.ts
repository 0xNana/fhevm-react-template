import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying FHEVM contracts...");

  // Deploy FHECounter
  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  // Deploy FHEVoting
  const deployedFHEVoting = await deploy("FHEVoting", {
    from: deployer,
    log: true,
  });

  // Deploy FHEBank
  const deployedFHEBank = await deploy("FHEBank", {
    from: deployer,
    log: true,
  });

  console.log("\n=== Deployment Summary ===");
  console.log(`FHECounter contract: ${deployedFHECounter.address}`);
  console.log(`FHEVoting contract:  ${deployedFHEVoting.address}`);
  console.log(`FHEBank contract:    ${deployedFHEBank.address}`);
  console.log("========================\n");

  console.log("✅ All contracts deployed successfully!");
  console.log("📝 Note: Verification will be handled manually later");
};
export default func;
func.id = "deploy_fhe_contracts"; // id required to prevent reexecution
func.tags = ["All"];
