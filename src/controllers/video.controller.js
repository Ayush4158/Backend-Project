import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { removeLocalFile } from "../utils/unlinkLocalFile.js"

const getAllVideos = asyncHandler ( async (req,res) => {
  const { page = 1, limit = 40, query, sortBy, sortType, userId } = req.query;

  const skip = (page-1)*limit
  const videos = await Video.aggregate([
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $sort: {createdAt: -1}
    }
  ]);
 
  if (!videos?.length) {
    throw new ApiError(404, "No videos found");
  }

  return res.status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler (async (req,res) => {
  const {title , description} = req.body

  const videoFileLocalPath = req.files?.videoFile[0]?.path
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path

  const videoFile = await uploadOnCloudinary(videoFileLocalPath)
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

  removeLocalFile(videoFileLocalPath)
  removeLocalFile(thumbnailLocalPath)

  if(!videoFile || !thumbnail){
    throw new ApiError(500 , 'Error while uploading file to cloudinary')
  }
  if(!title){
    throw new ApiError(400, "Title field cannot be empty")
  }

  const user = await User.findById(req.user?._id)

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videoFile?.duration,
    owner: user._id,
  })

  return res.status(200).json(new ApiResponse(200, {video}, "Video uploaded successfully"))
})

const getVideoById = asyncHandler (async (req,res) => {
  const { videoId } = req.params

  let video = await Video.findById(videoId)

  return res
    .status(200)
    .json(new ApiResponse(200, video , "video fetched successfully"))
})

const deleteVideo = asyncHandler (async (req,res) => {
  const {videoId} = req.params

  const video = await Video.findByIdAndDelete(videoId)
  if(!video){
    throw new ApiError(404, 'Video not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200 , {} , "video has been deleted"))

})

const updateVideo = asyncHandler (async (req,res) => {
  let video;
  const { videoId } = req.params

  const {title, description} = req.body

  const thumb = req.body.thumbnail
  const thumbnailLocalPath = req.file?.path

  if(thumbnailLocalPath){
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
      throw new ApiError(500 , "Failed to save thumbnail on cloudinary")
    }

    removeLocalFile(thumbnailLocalPath)

    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          thumbnail: thumbnail?.url || "",
          title: title || "",
          description: description || ""
        }
      },
      {
        new : true
      }
    )
  }
  if(!thumbnailLocalPath){
    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set:{
          thumbnail: thumb || "",
          title: title || "",
          description: description || ""
        }
      },
      {new : true}
    )
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {video} , "video is updated successfully"))
})

const togglePublishStatus = asyncHandler (async (req,res) => {
  const {videoId} = req.params

  const video = await Video.findById(videoId)
  const publishStatus = !video.isPublished

  await video.updateOne({isPublished : publishStatus})

  return res
    .status(200)
    .json(new ApiResponse(200 ,{} , `video is published status has been changed ${publishStatus}`))
})


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo
}