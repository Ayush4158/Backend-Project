import Router from "express"
import {createTweet, getAllTweets, getUserTweets} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT);

router
.route('/')
.get(getAllTweets)
.post(createTweet)

router.route("/user/:userId").get(getUserTweets)

export default router