const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()
const {
    storeImages,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")

const imageLocation = "./images/randomNFT"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: {
        trait_types: "cuteness",
        value: 100,
    },
}

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    console.log(`Chain id ${chainId}`)
    console.log(`deployer: ${deployer}`)
    let tokenUris
    if (process.env.UPLOAD_TO_PINATA == "true") {
        // tokenUris = await handleTokenUris()
        // console.log("Token uris", tokenUris)
        tokenUris = [
            "ipfs://QmWjSJJW7aBDNDBo8ZCJ23JSMRCqbgiutPJzkABwSPXgGB",
            "ipfs://QmXXPx1Jj4cAuya3WT1BByPibBF5WK8zHHDhGNeciajafF",
            "ipfs://QmQ8kidKN5YuNa9aR9XPDN4jVcg5F7XM1hUkDfZ5erAyG2",
        ]
    }

    let vrfCoordinatorV2Address,
        subscriptionId,
        VRFCoordinatorV2Mock,
        randomArgs
    //const signer = ethers.getSigner()

    log("------------------------------------")

    if (developmentChains.includes(network.name)) {
        const vrfContract = await deployments.get("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Mock = await ethers.getContractAt(
            vrfContract.abi,
            vrfContract.address,
        )

        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address

        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("------------------------------------------")
    log("Helllooo")
    // await storeImages(imageLocation)

    randomArgs = [
        vrfCoordinatorV2Address,
        networkConfig[chainId].gasLane,
        subscriptionId,
        networkConfig[chainId].callbackGasLimit,
        networkConfig[chainId].mintFee,
        tokenUris,
    ]

    const randomNFT = await deploy("RandomIpfsNFT", {
        from: deployer,
        args: randomArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (developmentChains.includes(network.name)) {
        await VRFCoordinatorV2Mock.addConsumer(
            subscriptionId,
            randomNFT.address,
        )
    }

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying..........")
        await verify(randomNFT.address, randomArgs)
    }

    log("------------------------------")
}
const handleTokenUris = async () => {
    tokenUris = []
    //store image in ipfs
    //store metadata in ipfs

    const { responses, files } = await storeImages(imageLocation)
    for (i in responses) {
        // create metadata
        //upload metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[i].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name}`
        tokenUriMetadata.image = `ipfs://${files[i].IpfsHash}`
        console.log(`uploading ${tokenUriMetadata.name}`)

        //store json to pinata/ ipfs
        const metadataUploadResponse =
            await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    // console.log("Token  uris uploaded", tokenUris)

    return tokenUris
}
module.exports.tags = ["all", "randomNFT", "main"]
