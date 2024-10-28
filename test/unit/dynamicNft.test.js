const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
          let dynamicSvgNft, deployer, mockV3Aggregator

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "dynamicsvg"])

              const nftContract = await deployments.get("DynamicSvgNFT")
              dynamicSvgNft = await ethers.getContract(
                  nftContract.abi,
                  nftContract.address,
              )

              const aggregatorContract =
                  await deployments.get("MockV3Aggregator")
              mockV3Aggregator = await ethers.getContract(
                  aggregatorContract.abi,
                  aggregatorContract.address,
              )
          })

          describe("constructor", () => {
              it("sets starting values correctly", async function () {
                  const lowSVG = await dynamicSvgNft.getLowSVG()
                  const highSVG = await dynamicSvgNft.getHighSVG()
                  const priceFeed = await dynamicSvgNft.getPriceFeed()
                  assert.equal(lowSVG, lowSVGImageuri)
                  assert.equal(highSVG, highSVGimageUri)
                  assert.equal(priceFeed, mockV3Aggregator.address)
              })
          })

          describe("mintNft", () => {
              it("emits an event and creates the NFT", async function () {
                  const highValue = ethers.utils.parseEther("1") // 1 dollar per ether
                  await expect(dynamicSvgNft.mintNft(highValue))
                      .to.emit(dynamicSvgNft, "CreatedNFT")
                      .withArgs(0, highValue)
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
                  const tokenURI = await dynamicSvgNft.tokenURI(0)
                  assert.equal(tokenURI, highTokenUri)
              })
              it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
                  const highValue = ethers.utils.parseEther("100000000") // $100,000,000 dollar per ether. Maybe in the distant future this test will fail...
                  const txResponse = await dynamicSvgNft.mintNft(highValue)
                  await txResponse.wait(1)
                  const tokenURI = await dynamicSvgNft.tokenURI(0)
                  assert.equal(tokenURI, lowTokenUri)
              })
          })

          // probably want more tests checking the svg -> token URI conversion svgToImageURI
          // More coverage of course
          // Maybe some tokenURI oddities
      })
