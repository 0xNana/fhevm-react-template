import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying FHEVoting contract...");

  const deployedFHEVoting = await deploy("FHEVoting", {
    from: deployer,
    log: true,
  });

  console.log(`FHEVoting contract deployed at: ${deployedFHEVoting.address}`);
  console.log("✅ FHEVoting deployed successfully!");
  console.log("📝 Note: Verification will be handled manually later");
};

export default func;
func.id = "deploy_fhe_voting";
func.tags = ["FHEVoting"];
