import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    // Aggregation pipeline to calculate total videos, views, likes
    const stats = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalLikes: { $sum: '$likes' },
                videoIds: { $push: '$_id' }
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    let totalComments = 0
    if (stats[0]?.videoIds?.length) {
        totalComments = await Comment.countDocuments({
            video: { $in: stats[0].videoIds }
        })
    }

    const channelStats = {
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes: stats[0]?.totalLikes || 0,
        totalSubscribers,
        totalComments
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            channelStats,
            'Channel stats fetched successfully'
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortType = 'desc' } = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (pageNumber < 1 || isNaN(pageNumber)) {
        throw new ApiError(400, 'Invalid page number')
    }

    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
        throw new ApiError(400, 'Limit must be between 1 and 100')
    }

    const sortDirection = sortType === 'asc' ? 1 : -1

    const videoPipeline = [
        {
            $match: { owner: new mongoose.Types.ObjectId(req.user?._id) }
        },
        {
            $sort: { createdAt: sortDirection }
        },
        {
            $project: {
                videoFilePublicId: 0,
                thumbnailPublicId: 0
            }
        }
    ]

    const options = {
        page: pageNumber,
        limit: limitNumber,
        customLabels: { docs: 'videos' }
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate(videoPipeline),
        options
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            'Channel videos fetched successfully'
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}