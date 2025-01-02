import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}


const registerUser = asyncHandler( async ( req,res ) => {
  //steps to register the user: 
  // 1.get user details from frontend, 
  // 2.validation - not empty, 
  // 3.check if user already exists: check username and email, 
  // 4.check for required images and check for avatar, 
  // 5.upload them to cloudinary, 
  // 6.create user object,
  //7.remove password and refresh token field from response,
  //8.check for user creation ,
  //9.return res.

  const {fullname, username, email, password } = req.body
  // console.log("email: ", email)

  // if(fullname === ""){
  //   throw new ApiError(400, "fullname is required")
  // }


  if(
    [fullname, email, username , password].some((field)=>(
      field?.trim() === ""
    ))
  ){
    throw new ApiError(400, "All fields are required")
  }

  // console.log(req.body)

  const existedUser = await User.findOne({
    $or: [{username}, {email}]
  })

  if(existedUser){
    throw new ApiError(409 , "user with email or username already exist")
  }

  // console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if(!avatarLocalPath){

    throw new ApiError(400, "Avatar File is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)


  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // console.log(user.password)

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
  
})

const loginUser = asyncHandler(async (req,res) => {
  //1.req body => data
  //2.username and email
  //3.find the user 
  //4.password check
  //5.access and refresh token generation
  //6.send cookie

  const {email,username, password} = req.body
  console.log(email)

  if(!username && !email){
    throw new ApiError(400, "username or email is required")
  }


  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!user){
    throw new ApiError(404, "user does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  // console.log(isPasswordValid)
  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).cookie("accessToken" , accessToken, options).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(
      200,
      {
        user: loggedinUser, accessToken, refreshToken
      },
      "user logged in successfully"
    )
  )
  
})

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "unautohrize request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, " Refresh token is expired or used")
    }

  
    const options = {
      htmlOnly: true,
      secure: true
    }

  
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const newRefreshToken =  refreshToken
  
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken
        },
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const changeCurrentPassword = asyncHandler (async (req, res)=>{
  const {oldPassword, newPassword , confirmNewPassword} = req.body

  const user = await User.findById(req.user?._id)

  const passwordCheck = await user.isPasswordCorrect(oldPassword)

  if(!passwordCheck){
    throw new ApiError(400, " Invalid old password")
  }
  console.log("old: ", user.password)
  user.password = confirmNewPassword
  await user.save({validateBeforeSave: false})
  console.log("new: ",user.password)

  return res
  .status(200)
  .json(new ApiResponse(200, {} , "password change successfully"))

})

const getCurrentUser = asyncHandler (async (req, res) => {
  return res
  .status(200)
  .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler( async(req, res) => {
  const {fullname, email } = req.body

  if(!fullname && !email){
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200 , user , "Account details updated successfully" ))
})

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uploading on avatart")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new : true}
  ).select("-password")

  //delete old avatar image

  return res
  .status(200)
  .json(new ApiResponse(200 , user , "Avatar updated successfully" ))
})

const updateCoverImage = asyncHandler ( async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400, "cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage){
    throw new ApiError(400, "Error while uploading on coverImage")
  }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage : coverImage.url
        }
      },
      {
        new: true
      }
    ).select("-password")

    return res
  .status(200)
  .json(new ApiResponse(200 , user , "Cover image updated successfully" ))
})

const getUserChannelProfile = asyncHandler (async (req,res) => {
  const {username} = req.params

  if(!username?.trim()) {
    throw new ApiError(400 , "username is missing")
  }

  const channel =  await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribed"
        },
        isSubscribed: {
          $condition:{
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCoun: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "channel does not exists")
  }

  return res
      .status(200)
      .json(
        new ApiResponse(200, channel[0] , "User channel fetched successfully")
      )
})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile}