import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {User} from "../models/user.models.js"

const getChannelStats = asyncHandler(async(req,res) => {
  const channelId = req.user?._id

  if(!isValidObjectId){
    throw new ApiError(400, "invalid channel ID")
  }

  const channel = await User.findById(channelId)
  if(!channel) {
    throw new ApiError(404 , "Channel not found")
  }

  const videos = await Video.aggregate([
    {
      $match:{
        owner: new mongoose.Types.ObjectId(channelId)
      }
    }
  ])

  const totalVideos = videos.length
  let totalViews = 0;

  videos.map((video) =>{
    if(video.isPublished){
      totalViews += video.views
    }
  })

  const subscribers = await Subscription.aggregate([
    {
      $match:{
        channel: new mongoose.Types.ObjectId(channelId)
      }
    }
  ])
  const totalSubscribers = subscribers.length

  const likes = await Like.aggregate([
    {
      $lookup:{
        from:"videos",
        localField:"video",
        foreignField: "_id",
        as: "videoInfo"
      },
    },
    {
      $unwind:"$videoInfo"
    },
    {
      $group:{
        _id: "$videoInfo._id",
        countLikes:{
          $sum:1
        }
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          subscribersCount: totalSubscribers,
          videoCount: totalVideos,
          viewCount: totalViews,
          likeCount: likes.length
        },
        "stats fetched successfully"
      )
    )
})

const getChannelVideos = asyncHandler(async(req,res) => {
  const channelId = req.user?.Id
  const {page = 1, limit = 40} = req.query

  if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channel ID")
  }

  const channel = await User.findById(channelId)
  if(!channel){
    throw new ApiError(404, "channel not found")
  }

  const videos = await Video.aggregate([
    {
      $match:{
        owner: new mongoose.Types.ObjectId(channelId)
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {videos} , "Video fetched successsfully")
    )
})

const getVideosOfAChannel = asyncHandler(async(req,res) => {
  const {userId} = req.params
  if(!isValidObjectId(userId)){
    throw new ApiError(400 , "Invalid user ID")
  }
  const videos = await Video.aggregate([
    {
      $match:{
        owner: new mongoose.Types.ObjectId(userId)
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {videos} , "videos fetched successfully")
    )
})

export {
  getChannelStats,
  getChannelVideos,
  getVideosOfAChannel,
}