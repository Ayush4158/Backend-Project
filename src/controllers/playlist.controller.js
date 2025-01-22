import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Video} from "../models/video.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async(req,res) => {
  const {name , description} = req.body

  const playlist = await Playlist.findOne({
    name: name,
    owner: req.user?._id
  })
  if(playlist){
    throw new ApiError(409, "This playlist already exists.")
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user?._id
  })

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {newPlaylist}, "playlist created successfully")
    )
})

const getUserPlaylist = asyncHandler(async(req,res) => {
  const {userId} = req.params

  if(!isValidObjectId(userId)){
    throw new ApiResponse(400 , "Invalid user id")
  }

  const userPlaylists = await Playlist.find({
    owner: userId
  }).sort('-createdAt')

  return res
    .status(200)
    .json(
      new ApiResponse(200 , userPlaylists, "user playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req,res ) => {
  const {playlistId} = req.params

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(404, "playlist not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200 , playlist  || {}, "playlist details fetched successfully")
    )
}) 

const addVideoToPlaylist = asyncHandler(async(req,res) => {
  const {playlistId, videoId} = req.params

  if(!isValidObjectId(videoId) || !isValidObjectId(playlistId)){
    throw new ApiError(400, "invalid playlistid or videoid")
  }

  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(404 , "playlist not found")
  }

  const video = await Video.findById(videoId)
  if(!video){
    throw new ApiError(404 , "video not found")
  }

  const isIncluded = playlist.videos.includes(video._id)
  if(isIncluded){
    throw new ApiError(409, "This video already in this playlist")
  }

  const addVideo = await Playlist.updateOne(
    playlistId,
    {
      $push: {
        videos: video
      }
    },
    {new: true}
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {addVideo} , 'video added to the playlist successfully')
    )
})

const removeVideoFromPlaylist = asyncHandler(async(req,res) => {
  const {playlistId , videoId} = req.params

  if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid playistId or videoId")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlistId){
    throw new ApiError(404 , "playlist not found")
  }

  const removeIndex = playlist.videos.indexOf(videoId)


  if(removeIndex === -1){
    throw new ApiError(400 , "this video isn't in your playlist")
  }

  const removeVideo = await Playlist.updateOne(
    playlistId,
    {
      $pull:{
        videos: videoId
      }
    },
    {new:true}
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {removeVideo} , "the video has been deleted form this playlist")
    )
})

const deletePlaylist = asyncHandler(async(req,res) => {
  const {playlistId} = req.params

  if(!isValidObjectId(playlistId)){
    throw new ApiError(400 , "Invalid playilst ID")
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId)

  if(!playlist){
    throw new ApiError(404 , "Playlist not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {} , "The playlsit was successfully deleted")
    )
})

const updatePlaylist = asyncHandler(async(req,res) => {
  const{playlistId} = req.params
  const {name, description} = req.body

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set:{
        name,
        description
      }
    },
    {new : true}
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {playlist} , "playlist was successfully updated")
    )
})

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}