import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        await Video.findOneAndUpdate(
            { _id: videoId, likes: { $gt: 0 } },
            { $inc: { likes: -1 } }
        )

        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, 'Like removed successfully')
        )
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } })

    return res.status(201).json(
        new ApiResponse(201, { isLiked: true, like }, 'Successfully liked the video')
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    validateMongoId(commentId, 'Comment ID')

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, 'Comment not found')
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        await Comment.findOneAndUpdate(
            { _id: commentId, likes: { $gt: 0 } },
            { $inc: { likes: -1 } }
        )

        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, 'Like removed successfully')
        )
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } })

    return res.status(201).json(
        new ApiResponse(201, { isLiked: true, like }, 'Successfully liked the comment')
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    validateMongoId(tweetId, 'Tweet ID')

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found')
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        await Tweet.findOneAndUpdate(
            { _id: tweetId, likes: { $gt: 0 } },
            { $inc: { likes: -1 } }
        )

        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, 'Like removed successfully')
        )
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: 1 } })

    return res.status(201).json(
        new ApiResponse(201, { isLiked: true, like }, 'Successfully liked the tweet')
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedRecords = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }
    })
        .sort({ createdAt: -1 })
        .populate({
            path: 'video',
            select: 'thumbnail title description duration views likes createdAt isPublished owner',
            populate: {
                path: 'owner',
                select: 'fullName username avatar'
            }
        })

    // Filter out records where the video document might have been removed
    const validLikedVideos = likedRecords
        .filter(record => record.video != null)
        .map(record => ({
            ...record.toObject(),
            video: record.video
        }))

    return res.status(200).json(
        new ApiResponse(
            200,
            validLikedVideos,
            'Liked videos fetched successfully'
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}