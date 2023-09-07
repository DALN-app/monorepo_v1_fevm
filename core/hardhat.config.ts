import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";

dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      mumbai: "0x1Dd04414C4909362B996306866bF2ba8dA7E9De2", //it can also specify a specific netwotk name (specified in hardhat.config.js)
      fevmTestnet: "0x1Dd04414C4909362B996306866bF2ba8dA7E9De2",
    },
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [process.env.MUMBAI_PRIVATE_KEY],
      name: "mumbai",
      chainId: 80001,
    },
    filecoinCalibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [process.env.FEVM_TESTNET_PRIVATE_KEY],
      name: "Filecoin Calibration",
      chainId: 314159,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
