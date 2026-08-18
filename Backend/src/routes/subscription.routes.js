import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/c/:channelId").post(verifyJWT, toggleSubscription);
router.route("/u/:channelId").get(optionalJWT, getUserChannelSubscribers);
router.route("/c/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;