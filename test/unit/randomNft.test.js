const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
const { describe, beforeEach, it } = require("node:test")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random nft test", async () => {
          let randomNFT, deployer, VRFCoordinatorV2Mock

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]

              await deployments.fixture(["mocks", "randomNFT"])

              const nftContract = await deployments.get("RandomIpfsNFT")
              randomNFT = await ethers.getContractAt(
                  nftContract.abi,
                  nftContract.address,
              )

              const vrfContract = await deployments.get("VRFCoordinatorV2Mock")
              VRFCoordinatorV2Mock = await ethers.getContractAt(
                  vrfContract.abi,
                  vrfContract.address,
              )
          })

          describe("Constructor", () => {
              it("sets starting values correctly", async () => {
                  const dogTokenUri = await randomNFT.getDogTokenUris(0)
                  //   const isInitialized = await randomNFT.getInitialized()
                  assert(dogTokenUri.includes("ipfs://"))
                  //   assert.equal(isInitialized, true)
              })
          })

          describe("Request nft", () => {
              it("Reverts if eth is not sent", async () => {
                  await expect(randomNFT.requestNft()).to.be.revertedWith(
                      "RandomIpfsNFT__NeedMoreETHSent",
                  )
              })

              it("Reverts if not enough eth sent", async () => {
                  const fee = await randomNFT.getMintFee()
                  await expect(
                      randomNFT.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      }),
                  ).to.be.revertedWith("RandomIpfsNFT__NeedMoreETHSent")
              })

              it("emits an events and kicks off random word request", async () => {
                  const fee = await randomNFT.getMintFee()
                  await expect(
                      randomNFT.requestNft({ value: fee.toString() }),
                  ).to.emit(randomNFT, "NFTRequested")
              })
          })

          //   describe("fulfill random words", () => {
          //       it("mints NFT after random number is returned", async function () {
          //           await new Promise(async (resolve, reject) => {
          //               randomNFT.once(
          //                   "NFTMinted",
          //                   async (tokenId, breed, minter) => {
          //                       try {
          //                           console.log("NFTMinted event caught")
          //                           console.log(`tokenId: ${tokenId}`)
          //                           console.log(`breed: ${breed}`)
          //                           console.log(`minter: ${minter.address}`)
          //                           const tokenUri = await randomNFT.tokenURI(
          //                               tokenId.toString(),
          //                           )
          //                           const tokenCounter =
          //                               await randomNFT.getTokenCounter()
          //                           const dogUri =
          //                               await randomNFT.getDogTokenUris(
          //                                   breed.toString(),
          //                               )
          //                           assert.equal(
          //                               tokenUri.toString().includes("ipfs://"),
          //                               true,
          //                           )
          //                           assert.equal(
          //                               dogUri.toString(),
          //                               tokenUri.toString(),
          //                           )
          //                           assert.equal(
          //                               +tokenCounter.toString(),
          //                               +tokenId.toString() + 1,
          //                           )
          //                           assert.equal(minter, deployer.address)
          //                           resolve()
          //                       } catch (e) {
          //                           console.log(e)
          //                           reject(e)
          //                       }
          //                   },
          //               )
          //               try {
          //                   const fee = await randomNFT.getMintFee()
          //                   const requestNftResponse = await randomNFT.requestNft(
          //                       {
          //                           value: fee.toString(),
          //                       },
          //                   )

          //                   const requestNftReceipt =
          //                       await requestNftResponse.wait(1)

          //                   console.log(
          //                       "event",
          //                       requestNftReceipt.events[1].args.requestId,
          //                   )
          //                   await VRFCoordinatorV2Mock.fulfillRandomWords(
          //                       requestNftReceipt.events[1].args.requestId,
          //                       randomNFT.address,
          //                   )
          //               } catch (e) {
          //                   console.log(e)
          //                   reject(e)
          //               }
          //           })
          //       })
          //   })

          describe("getbreeding from modded range", () => {
              it("should return pug if >10", async () => {
                  const breed = await randomNFT.getBreedFromModdedRange(7)
                  assert.equal(breed, 0)
              })

              it("should revert if moddedrange > 99", async () => {
                  await expect(
                      randomNFT.getBreedFromModdedRange(100),
                  ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds")
              })
          })
      })
