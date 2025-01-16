import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    .catch((error) => {
      console.log("Error in loacl file upload: ", error)
    })
    //file has been uploaded successfully
    // console.log("File uploaded on cloudinary", response.url)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)
    // console.log("Error in file upload on cloudinary: ", error)
    return null
  }
}

export {uploadOnCloudinary}
