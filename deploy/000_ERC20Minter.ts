import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { BigNumber, BigNumberish } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const { deployer } = await getNamedAccounts();

  const tokenName = "SomeRandomToken"
  const tokenSymbol = "SRT"

  await deploy("ERC20Minter", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
    args: [
      tokenName,
      tokenSymbol
    ],
  });
};

export default func;
func.tags = ["ERC20Minter"];
