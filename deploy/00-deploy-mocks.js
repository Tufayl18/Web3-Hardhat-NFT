const { ethers, network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
} = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.20")
const GAS_PRICE_LINK = 1e9

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    console.log("Mocks deployer: ", deployer)

    if (developmentChains.includes(network.name) || chainId == 31337) {
        log("Local Network.")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK], // constructor parameters
        })

        await deploy("MockV3Aggregator", {
            // contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE], // constructor parameters
        })

        log("Mocks Deployed.")
        log("------------------")
    }
}
module.exports.tags = ["all", "mocks"]
