import { Router } from "express";
import {toggleVideoLike , toggleCommentLike, toggleTweetLike, getLikedVideos, getAVideoIsLikedOrNot, getACommentIsLikedOrNot } from '../controllers/like.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/toogle/v/:videoId").post(toggleVideoLike)
router.route("/toogle/c/:commentId").post(toggleCommentLike)
router.route("/toogle/t/:tewwtId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)
router.route("/isLiked/v/:videoId").get(getAVideoIsLikedOrNot)
router.route("/isLiked/c/:commentId").get(getACommentIsLikedOrNot)


export default router