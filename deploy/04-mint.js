const { rejects } = require("assert")
const { ethers, network } = require("hardhat")
const { resolve } = require("path")
const { developmentChains } = require("../helper-hardhat-config")
const { builtinModules } = require("module")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const deployer = (await getNamedAccounts()).deployer
    console.log("Mint deployer: ", deployer)

    const signer = await ethers.provider.getSigner()
    console.log("Mint signer: ", signer.address)
    const chainId = network.config.chainId

    //Basic nft

    const basicContract = await deployments.get("BasicNFT")
    const basicNft = await ethers.getContractAt(
        basicContract.abi,
        basicContract.address,
        deployer.address,
    )
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT at 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    //randomipfs nft

    const randomContract = await deployments.get("RandomIpfsNFT")
    const randomNft = await ethers.getContractAt(
        randomContract.abi,
        randomContract.address,
        deployer.address,
    )
    const mintFee = await randomNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000)
        randomNft.once("NFTMinted", async () => {
            resolve()
        })
    })
    const randomNftMintTx = await randomNft.requestNft({
        value: mintFee.toString(),
    })
    const randomNfttxReceipt = await randomNftMintTx.wait(1)

    if (developmentChains.includes(network.name)) {
        const requestId = randomNfttxReceipt.events[1].args.requestId.toString()
        const vrfContract = await deployments.get("VRFCoordinatorV2Mock")
        const VRFCoordinatorV2Mock = await ethers.getContractAt(
            vrfContract.abi,
            vrfContract.address,
            deployer.address,
        )
        VRFCoordinatorV2Mock.fulfillRandomWords(requestId, randomNft.address)
        console.log(
            `Random IPFS Nft at index 0 tokenURI ${await randomNft.tokenURI(0)}`,
        )

        //dynamic svg nft

        const highValue = ethers.utils.parseEther("4000")
        const dynamicContract = await deployments.get("DynamicSvgNFT")
        const dynamicSvgNft = await ethers.getContractAt(
            dynamicContract.abi,
            dynamicContract.address,
            deployer.address,
        )

        const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(
            highValue.toString(),
        )
        await dynamicSvgNftMintTx.wait(1)
        console.log(
            `Dynamic Svg Nft at index 0 tokenURI ${await dynamicSvgNft.tokenURI(0)}`,
        )
    }
}

module.exports.tags = ["all", "main"]
