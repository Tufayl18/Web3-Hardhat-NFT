const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
// all the images inside ./images/randomNFT will be given by  path.resolve(imageFilePath)
const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

const storeImages = async (imageFilePath) => {
    const fullImagesPath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("uploading to ipfs")
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`,
        )
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }
        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options,
            )
            responses.push(response)
        } catch (e) {
            console.log("Error", e)
        }
    }
    return { responses, files }
}

const storeTokenUriMetadata = async (metadata) => {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log("error", e)
    }
}

module.exports = { storeImages, storeTokenUriMetadata }
