import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying FHECounter contract...");

  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  console.log(`FHECounter contract deployed at: ${deployedFHECounter.address}`);
  console.log("✅ FHECounter deployed successfully!");
  console.log("📝 Note: Verification will be handled manually later");
};

export default func;
func.id = "deploy_fhe_counter";
func.tags = ["FHECounter"];
