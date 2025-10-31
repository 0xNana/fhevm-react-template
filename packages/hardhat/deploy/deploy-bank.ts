import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying FHEBank contract...");

  const deployedFHEBank = await deploy("FHEBank", {
    from: deployer,
    log: true,
  });

  console.log(`FHEBank contract deployed at: ${deployedFHEBank.address}`);
  console.log("✅ FHEBank deployed successfully!");
  console.log("📝 Note: Verification will be handled manually later");
};

export default func;
func.id = "deploy_fhe_bank";
func.tags = ["FHEBank"];
