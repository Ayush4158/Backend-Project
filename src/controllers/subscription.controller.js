import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose, {isValidObjectId} from "mongoose";

const toggleSubscription = asyncHandler(async(req,res) => {
  const { channelId } = req.params

  if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channel Id")
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId
  })

  if(isSubscribed){
    await Subscription.findByIdAndDelete(isSubscribed?._id)

    return res
      .status(200)
      .json(new ApiResponse(200, {subscribed: false } , "unsubscribed successfull"))
  }

  if(!isSubscribed){
    await Subscription.create({
      subscribed : req.user?._id,
      channel: channelId
    })

    return res  
      .status(200)
      .json(new ApiResponse(200 , {subscribed: true} , "Subscribed successfully"))
  }
})


const getUserChannelSubscriber = asyncHandler (async (req,res) => {
  const {channelId} = req.params

  const subscribers = await Subscription.aggregate([
    {
      $match:{
        channel: new mongoose.Types.ObjectId(channelId)
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200 , {totalCount: subscribers.length ,subscribers} , "subscribers fetched successfully"))
})

const getSubscribedChannel = asyncHandler (async (req,res) => {
  const {subscriberId} = req.params

  const channelSubscribedTo = await Subscription.aggregate([
    {
      $match:{
        subscriber: new mongoose.Types.ObjectId(subscriberId) 
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200 , {totalChannelSubscribed: channelSubscribedTo.length, channelSubscribedTo} , "channels fetched successfully"))
})

export {
  toggleSubscription,
  getUserChannelSubscriber,
  getSubscribedChannel
}