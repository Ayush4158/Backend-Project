import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const addComment = asyncHandler(async(req,res)=> {
  const {videoId} = req.params
  const {content} = req.body

  const video = await Video.findById(videoId)

  if(!video){
    throw new ApiError(400, "Invalid video id")
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id
  })

  return res
    .status(200)
    .json(200 , {comment} , "Comment craeted successfully")
})

const getVideoComments = asyncHandler(async(req,res) => {
  const {videoId} = req.params
  const {page=1, limit=30} = req.query

  if(!isValidObjectId(videoId)){
    throw new ApiError(400 , "Invalid Video ID")
  }

  const skip = (page-1) * limit
  const comments = await Comment.aggregate([
    {
      $match:{
        video : new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $sort : {createdAt : -1}
    }
  ])

  return res.status(200).json(new ApiResponse(200 , {comments} , "Comments fetched successfully"))
})

const updateComment = asyncHandler(async(req,res) => {
  const {commentId} = req.params

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set:{
        content: content
      }
    },
    {
      new: true
    }
  )

  return res
    .status(200)
    .json(200 , {comment} , "Comment updated successfully")
})

const deleteComment = asyncHandler(async(req,res) => {
  const {commentId} = req.params

  const comment = await Comment.findByIdAndDelete(commentId)

  return res
    .status(200)
    .json(200 , {comment} , "Comment is delted successfully")
})

export {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
}