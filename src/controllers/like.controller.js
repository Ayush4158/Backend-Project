import {Like} from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import mongoose, { isValidObjectId } from "mongoose"

const toggleVideoLike = asyncHandler(async(req,res) => {
  const {videoId} = req.params

  const video = await Video.findById(videoId)
  if(!video){
    throw new ApiError(404, "Video not found")
  }

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video ID")
  }
  const liked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })

  if(liked){
    await Like.findByIdAndDelete(liked._id)

    return res
      .status(200)
      .json(
        new ApiResponse(200 , {isLiked: false}, "like is toggled to false on video")
      )
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user?._id
  })

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {isLiked: true} , "like is toggled to true on video")
    )
})

const toggleCommentLike = asyncHandler (async(req,res) => {
  const {commentId} = req.params

  const comment = await Comment.findById(commentId)
  if(!comment){
    throw new ApiError(404, "Comment not found")
  }

  if(!isValidObjectId(commentId)){
    throw new ApiError(400 , "Invalid comment ID")
  }

  const liked = await Like.findOne({
    comment: commentId,
    likedABy: req.user?._id
  })

  if(liked){
    await Like.findByIdAndDelete(liked._id)

    return res
      .status(200)
      .json(
        new ApiResponse(200 , {isLiked: false}, "like is toggled to false on comment")
      )
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user?._id
  })

  return res
    .status(200)
    .json(200 , {isLiked: true} , "like is toggled to true on comment")
})

const toggleTweetLike = asyncHandler (async(req,res) => {
  const {tweetId} = req.params
  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new ApiError(404 , "Tweet is not found")
  }

  if(!isValidObjectId(tweetId)){
    throw new ApiError(400 , "Invalid tweet id")
  }

  const liked = await Like.findone({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  if(liked){
    await Like.findByIdAndDelete(liked._id)

    return res
      .status(200)
      .json(200 , {isLiked: false} , "like is toggled to false on tweet")
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  return res
    .status(200)
    .json(200 , {isLiked: true} , "like is toggled to true on tweet")
})

const getLikedVideos = asyncHandler (async(req,res) => {
  const likedVideosAggregate = await Like.agrregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from:"videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline:[
          {
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails"
            },
          },
          {
            $unwind:"$ownerDetails"
          }
        ]
      }
    },
    {
      $unwind: "$likedVideo"
    },
    {
      $sort:{
        createdAt: -1
      }
    },
    {
      $project:{
        _id: 1,
        likedVideo:{
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
              username: 1,
              fullName: 1,
              avatar: 1,
          },
        }
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(200 , likedVideosAggregate, "liked videos fetched successfully")
    )
})

const getAVideoIsLikedOrNot = asyncHandler (async(req,res) => {
  const {videoId} = req.params
  const videoIsLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })
  return res
    .status(200)
    .json(
      new ApiResponse(200 , videoIsLiked, "get successfully")
    )
})

const getACommentIsLikedOrNot = asyncHandler (async(req,res) => {
  const {commentId} = req.params

  const commentIsLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id
  })

  return res
    .status(200)
    .json(
      new ApiResponse(200 , commentIsLiked, "get successfully")
    )
})

export{
  toggleVideoLike,
  toggleTweetLike,
  toggleCommentLike,
  getACommentIsLikedOrNot,
  getLikedVideos,
  getAVideoIsLikedOrNot
}