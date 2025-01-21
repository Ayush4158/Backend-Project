import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import {Tweet} from "../models/tweet.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async(req,res) => {
  const user = await User.findById(req.user?._id)

  const{ content } = req.body

  if(!user){
    throw new ApiError(401, 'Not authenticated')
  }
  if(!content){
    throw new ApiError(400, 'Content field is reequired')
  }

  const tweet = await Tweet.create({
    owner: user._id,
    content: content
  })

  return res
    .status(200)
    .json(new ApiResponse(200, tweet , "Tweet created successfully"))
})

const getUserTweets = asyncHandler (async(req,res) => {
  const {userId} = req.params

  const tweets = await Tweet.aggregate([
    {
      $match:{
        owner : new mongoose.Types.ObjectId(userId)
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "successfully fetched users tweet" ))
})

const updateTweet = asyncHandler(async(req,res) => {
  const {tweetId} = req.params
  const {content} = req.body

  let tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set:{
        content
      }
    },
    {new: true}
  )

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Updated successfully"))
})

const deleteTweet = asyncHandler(async(req,res) => {
  const {tweetId} = req.params

  const tweet = await Tweet.findByIdAndDelete(tweetId)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deleted successfully"))
})

const getAllTweets = asyncHandler(async(req,res) =>{
  const tweets = await Tweet.find();
  return res
    .status(200)
    .json(new ApiResponse(200, {tweets}, "tweet fetched successfully"))
})


export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
  getAllTweets
}