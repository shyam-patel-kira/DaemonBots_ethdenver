/** @format */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "fhenix-hardhat-plugin";
// if using the docker plugin
// import "fhenix-hardhat-docker";

const config: HardhatUserConfig = {
	solidity: "^0.8.20",
};

export default config;
