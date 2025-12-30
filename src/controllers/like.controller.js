import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video

    const { videoId } = req.params   // Extract videoId from URL params and validate its format
    validateMongoId(videoId, 'Video ID')   // Validate that videoId is a valid MongoDB ObjectId

    const video = await Video.findById(videoId)   // Check if the video actually exists in the database
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const existingLike = await Like.findOne({   // Check if the user has already liked this video
        video: videoId,
        likedBy: req.user._id
    })

    // If a like exists, remove it and decrease the video's like count
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)   // Remove the like document

        // Decrease the video's like count by 1. Only decrement if likes > 0 (prevents negative counts)
        await Video.findOneAndUpdate(
            {
                _id: videoId,
                likes: { $gt: 0 }       // Avoids negative values
            },
            { $inc: { likes: -1 } }    // Subtract 1 from like count
        )

        // Return success response to indicate like removal
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                'Like removed successfully'
            ))
    }

    // If no like exists, create a new like record
    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    // Increase the like count on the video
    await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likes: 1 } }
    )

    // Return the newly created like as confirmation
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            like,
            'Successfully liked the video'
        ))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment

    const { commentId } = req.params   // Extract commentId from URL parameters
    validateMongoId(commentId, 'Comment ID')   // Validate that commentId is a valid MongoDB ObjectId

    // Check if the comment exists in the database
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, 'Comment not found')
    }

    // Check if the user has already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    // If like exists, remove it (unlike)
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)   // Delete the like document from the database

        // Decrease the comment's like count by 1. Only decrement if likes > 0 (prevents negative counts)
        await Comment.findOneAndUpdate(
            {
                _id: commentId,
                likes: { $gt: 0 }   // Match only if likes is greater than zero
            },
            { $inc: { likes: -1 } }   // Subtract 1 like
        )

        // Send success response for unlike
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                'Like removed successfully'
            ))
    }

    // If no existing like, create a new one (like the comment)
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    // Increase the comment's like count by 1
    await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { likes: 1 } }   // Add 1 like
    )

    // Send success response for like with the created like document
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            like,
            'Successfully liked the comment'
        ))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet

    const { tweetId } = req.params   // Extract tweet ID from request parameters
    validateMongoId(tweetId, 'Tweet ID')   // Validate that tweetId is a valid MongoDB ObjectId

    // Check if the tweet exists in the database
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found')   // If no tweet found, return an error response
    }

    // Check if the current user has already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    // If a like is found, it means user wants to remove the like
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)   // Delete the like record from the Like collection

        // Decrement the like count on the tweet if likes are greater than zero
        await Tweet.findOneAndUpdate(
            {
                _id: tweetId,
                likes: { $gt: 0 } // This ensures likes never go below zero
            },
            { $inc: { likes: -1 } } // Decrease likes by 1
        )

        // Send success response for removing like
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                'Like removed successfully'
            ))
    }

    // If no previous like exists, create a new like entry
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    // Increase the like count of the tweet by 1
    await Tweet.findByIdAndUpdate(
        tweetId,
        { $inc: { likes: 1 } }
    )

    // Send response confirming that the tweet was liked
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            like,
            'Successfully liked the tweet'
        ))
})


const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    // Extract all liked entries where the current user liked a video
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }   // '$exists: true' ensures we only fetch likes that are linked to a video field
    })
        .select('video')   // Only return the video field from each Like document
        .populate({   // Populate the video details using the reference in the Like model
            path: 'video',
            select: 'thumbnail title views owner',   // Include only useful fields from the video
            populate: {   // Also populate the video owner field to show owner's info
                path: 'owner',
                select: 'fullName'
            }
        })

    // If no liked videos exist for the current user, return a 404 error
    if (likedVideos.length === 0) {
        throw new ApiError(404, 'No liked videos found')
    }

    // Respond with success and send back the list of liked videos
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            likedVideos,
            'Liked videos fetched successfully'
        ))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}