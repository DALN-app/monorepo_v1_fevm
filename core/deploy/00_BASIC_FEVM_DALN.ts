import { DeployFunction } from "hardhat-deploy/types";

import { THardhatRuntimeEnvironmentExtended } from "~/helpers/types/THardhatRuntimeEnvironmentExtended";

const func: DeployFunction = async (
  hre: THardhatRuntimeEnvironmentExtended
) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("Basic_FEVM_DALN", {
    from: deployer,
    log: true,
    // waitConfirmations: 1,
  });

  // try {
  //   await hre.run("verify:verify", {
  //     address: BasicFEVMDALN.address,
  //   });
  //   console.log("Verified BasicFEVMDALN");
  // } catch (err) {
  //   console.log("Failed to verify BasicFEVMDALN", err);
  // }
};
export default func;
func.tags = ["Basic_FEVM_DALN"];
