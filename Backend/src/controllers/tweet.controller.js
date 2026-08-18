import mongoose from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new ApiError(400, 'Content should not be empty')
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id
    })

    const populatedTweet = await Tweet.findById(tweet._id).populate('owner', 'fullName username avatar')

    return res.status(201).json(
        new ApiResponse(201, populatedTweet, 'Tweet posted successfully')
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    validateMongoId(userId, 'User ID')

    const userExists = await User.exists({ _id: userId })
    if (!userExists) {
        throw new ApiError(404, 'User not found')
    }

    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

    const tweets = await Tweet.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: '$owner' },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'likesData'
            }
        },
        {
            $addFields: {
                likesCount: { $size: '$likesData' },
                isLiked: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [currentUserId, null] },
                                { $in: [currentUserId, '$likesData.likedBy'] }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likesData: 0
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, tweets, 'Tweets fetched successfully')
    )
})

// Feed of all community posts
const getAllTweetsFeed = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

    const tweets = await Tweet.aggregate([
        {
            $sort: { createdAt: -1 }
        },
        {
            $limit: 50
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: '$owner' },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'likesData'
            }
        },
        {
            $addFields: {
                likesCount: { $size: '$likesData' },
                isLiked: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [currentUserId, null] },
                                { $in: [currentUserId, '$likesData.likedBy'] }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likesData: 0
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, tweets, 'Community feed fetched successfully')
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    validateMongoId(tweetId, 'Tweet ID')

    const oldTweet = await Tweet.findById(tweetId)
    if (!oldTweet) {
        throw new ApiError(404, 'Tweet not found')
    }

    if (!oldTweet.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to edit this tweet')
    }

    const { editedContent } = req.body

    if (!editedContent || typeof editedContent !== 'string' || editedContent.trim() === '') {
        throw new ApiError(400, 'Content should not be empty')
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: editedContent.trim() } },
        { new: true }
    ).populate('owner', 'fullName username avatar')

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, 'Tweet updated successfully')
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    validateMongoId(tweetId, 'Tweet ID')

    const oldTweet = await Tweet.findById(tweetId)
    if (!oldTweet) {
        throw new ApiError(404, 'Tweet not found')
    }

    if (!oldTweet.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to delete this tweet')
    }

    await oldTweet.deleteOne()
    await Like.deleteMany({ tweet: tweetId })

    return res.status(200).json(
        new ApiResponse(200, {}, 'Tweet deleted successfully')
    )
})

export {
    createTweet,
    getUserTweets,
    getAllTweetsFeed,
    updateTweet,
    deleteTweet
}