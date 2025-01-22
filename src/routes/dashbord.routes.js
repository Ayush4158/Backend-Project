import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos, getVideosOfAChannel } from "../controllers/dashbord.controller.js";
const router = Router()

router.use(verifyJWT)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)
router.route("/:userId").get(getVideosOfAChannel)

export default router