const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit test", () => {
          console.log(network.name)
          let deployer, BasicNFT
          beforeEach(async () => {
              console.log("hii")
              const accounts = await ethers.getSigners()
              //   console.log("account", accounts)

              deployer = accounts[0]
              //   console.log("deployer", deployer)
              await deployments.fixture(["basicnft"])
              const nftContract = await deployments.get("BasicNFT")
              BasicNFT = await ethers.getContractAt(
                  nftContract.abi,
                  nftContract.address,
              )
              //   console.log(BasicNFT)
          })

          describe("Constructor", () => {
              it("Initializes the NFT correctly", async () => {
                  const nftNAme = await BasicNFT.name()
                  const symbol = await BasicNFT.symbol()
                  const counter = await BasicNFT.getTokenCounter()

                  assert.equal(nftNAme, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(counter.toString(), "0")
              })
          })

          describe("Mint", () => {
              beforeEach(async () => {
                  const tx = await BasicNFT.mintNft()
                  await tx.wait(1)
              })

              it("updates after minting", async () => {
                  const tokenUri = await BasicNFT.tokenURI(0)
                  const tokenCounter = await BasicNFT.getTokenCounter()

                  assert.equal(tokenUri, await BasicNFT.TOKEN_URI())
                  assert.equal(tokenCounter.toString(), "1")
              })

              it("Show the correct balance and owner of an NFT", async () => {
                  const owner = await BasicNFT.ownerOf(0)
                  const balance = await BasicNFT.balanceOf(deployer.address)

                  assert.equal(owner, deployer.address)
                  assert.equal(balance.toString(), "1")
              })
          })
      })
