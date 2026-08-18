import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweetsFeed,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public / optional auth routes
router.route("/feed").get(optionalJWT, getAllTweetsFeed);
router.route("/user/:userId").get(optionalJWT, getUserTweets);

// Secured routes
router.route("/").post(verifyJWT, createTweet);
router.route("/:tweetId")
    .patch(verifyJWT, updateTweet)
    .delete(verifyJWT, deleteTweet);

export default router;