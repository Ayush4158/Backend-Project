import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannel, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router
.route("/c/:channelId")
.get(getUserChannelSubscriber)
.post(toggleSubscription)

router.route("/u/:subscriberId").get(getSubscribedChannel)

export default router

