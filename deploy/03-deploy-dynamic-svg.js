const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    //const signer = ethers.getSigner()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress, args
    if (developmentChains.includes(network.name)) {
        const aggregatorContract = await deployments.get("MockV3Aggregator")
        const ethUsdAggregator = await ethers.getContractAt(
            aggregatorContract.abi,
            aggregatorContract.address,
        )
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("--------------------------------------------------------")
    const lowSVG = await fs.readFileSync("./images/dynamicNFT/frown.svg", {
        encoding: "utf-8",
    })
    const highSVG = await fs.readFileSync("./images/dynamicNFT/happy.svg", {
        encoding: "utf-8",
    })

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]

    const dynamicsvgNFT = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.confirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying..........")
        await verify(dynamicsvgNFT.address, args)
    }

    log("------------------------------")
}

module.exports.tags = ["all", "dynamicsvg", "main"]
