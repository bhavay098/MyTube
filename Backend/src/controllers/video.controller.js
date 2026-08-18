import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import mongoose from "mongoose"

// Function to get all videos with filtering, category, sorting, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
        category,
        duration
    } = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (pageNumber < 1 || isNaN(pageNumber)) {
        throw new ApiError(400, 'Invalid page number')
    }

    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
        throw new ApiError(400, 'Limit must be between 1 and 100')
    }

    const skip = (pageNumber - 1) * limitNumber
    const matchCondition = { isPublished: true }

    // Filter by userId/creator if provided
    if (userId) {
        validateMongoId(userId, 'User ID')
        matchCondition.owner = new mongoose.Types.ObjectId(userId)
    }

    // Filter by category
    if (category && category !== 'All') {
        matchCondition.category = category
    }

    // Filter by video duration
    if (duration === 'short') {
        matchCondition.duration = { $lt: 240 } // < 4 mins
    } else if (duration === 'medium') {
        matchCondition.duration = { $gte: 240, $lte: 1200 } // 4 to 20 mins
    } else if (duration === 'long') {
        matchCondition.duration = { $gt: 1200 } // > 20 mins
    }

    // Search filter across title, description, or tags
    if (query && query.trim()) {
        const sanitizedQuery = query.trim()
        matchCondition.$or = [
            { title: { $regex: sanitizedQuery, $options: 'i' } },
            { description: { $regex: sanitizedQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(sanitizedQuery, 'i')] } }
        ]
    }

    // Build sorting options
    const sortOptions = {}
    const sortDirection = sortType === 'asc' ? 1 : -1

    if (sortBy === 'trending' || sortBy === 'popular' || sortBy === 'views') {
        sortOptions.views = -1
        sortOptions.createdAt = -1
    } else if (sortBy === 'likes') {
        sortOptions.likes = -1
        sortOptions.createdAt = -1
    } else if (sortBy) {
        sortOptions[sortBy] = sortDirection
    } else {
        sortOptions.createdAt = -1
    }

    // Pipeline to fetch videos with populated owner details
    const videos = await Video.aggregate([
        { $match: matchCondition },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limitNumber },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'owner',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        { $unwind: '$owner' }
    ])

    const totalVideos = await Video.countDocuments(matchCondition)
    const totalPages = Math.ceil(totalVideos / limitNumber)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    totalVideos,
                    totalPages,
                    currentPage: pageNumber,
                    limit: limitNumber,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            },
            'Videos fetched successfully'
        )
    )
})

// Publish a new video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description, category = "All", tags } = req.body

    if (!title || !description) {
        throw new ApiError(400, 'Title and description are required')
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, 'Both video and thumbnail files are required')
    }

    // Upload video file & thumbnail to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
        throw new ApiError(400, 'Error while uploading files to cloud storage')
    }

    // Parse tags array if string
    let parsedTags = []
    if (tags) {
        parsedTags = Array.isArray(tags)
            ? tags
            : tags.split(',').map((t) => t.trim()).filter(Boolean)
    }

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        videoFilePublicId: uploadedVideo.public_id,
        thumbnail: uploadedThumbnail.url,
        thumbnailPublicId: uploadedThumbnail.public_id,
        title: title.trim(),
        description: description.trim(),
        category: category || 'All',
        tags: parsedTags,
        duration: uploadedVideo.duration || 0,
        owner: req.user?._id
    })

    if (!video) {
        throw new ApiError(500, "Failed to publish video");
    }

    return res.status(201).json(
        new ApiResponse(201, video, 'Video published successfully')
    )
})

// Get video details by ID with populated owner, subscribe status, and view increment
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    }).populate('owner', 'fullName username avatar bio')

    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    // Increment view count if not the video owner
    const isOwner = req.user && video.owner?._id?.toString() === req.user._id.toString()
    if (!isOwner) {
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
        video.views += 1
    }

    // Add to user's watch history if authenticated
    if (req.user) {
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchHistory: videoId } }
        )
    }

    // Fetch subscriber count and isSubscribed state for the video owner
    let subscribersCount = 0
    let isSubscribed = false

    if (video.owner?._id) {
        subscribersCount = await Subscription.countDocuments({ channel: video.owner._id })
        if (req.user) {
            const sub = await Subscription.exists({
                subscriber: req.user._id,
                channel: video.owner._id
            })
            isSubscribed = !!sub
        }
    }

    // Check if the current user liked this video
    let isLiked = false
    if (req.user) {
        const like = await Like.exists({
            video: videoId,
            likedBy: req.user._id
        })
        isLiked = !!like
    }

    const videoData = video.toObject()
    videoData.owner = {
        ...videoData.owner,
        subscribersCount,
        isSubscribed
    }
    videoData.isLiked = isLiked

    return res.status(200).json(
        new ApiResponse(200, videoData, 'Video fetched successfully')
    )
})

// Get related / recommended videos for watch page sidebar
const getRelatedVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const currentVideo = await Video.findById(videoId)
    if (!currentVideo) {
        throw new ApiError(404, 'Video not found')
    }

    const relatedVideos = await Video.aggregate([
        {
            $match: {
                _id: { $ne: new mongoose.Types.ObjectId(videoId) },
                isPublished: true,
                $or: [
                    { category: currentVideo.category },
                    { owner: currentVideo.owner },
                    { tags: { $in: currentVideo.tags || [] } }
                ]
            }
        },
        { $sort: { views: -1, createdAt: -1 } },
        { $limit: 10 },
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
        { $unwind: '$owner' }
    ])

    // Fallback if not enough matching category/tag videos: fetch general latest videos
    let results = relatedVideos
    if (results.length < 5) {
        const existingIds = [new mongoose.Types.ObjectId(videoId), ...results.map(v => v._id)]
        const fallbackVideos = await Video.aggregate([
            {
                $match: {
                    _id: { $nin: existingIds },
                    isPublished: true
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 - results.length },
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
            { $unwind: '$owner' }
        ])
        results = [...results, ...fallbackVideos]
    }

    return res.status(200).json(
        new ApiResponse(200, results, 'Related videos fetched successfully')
    )
})

// Get top trending videos
const getTrendingVideos = asyncHandler(async (req, res) => {
    const trendingVideos = await Video.aggregate([
        { $match: { isPublished: true } },
        { $sort: { views: -1, likes: -1, createdAt: -1 } },
        { $limit: 24 },
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
        { $unwind: '$owner' }
    ])

    return res.status(200).json(
        new ApiResponse(200, trendingVideos, 'Trending videos fetched successfully')
    )
})

// Update video details (thumbnail is now optional!)
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const oldVideo = await Video.findById(videoId)
    if (!oldVideo) {
        throw new ApiError(404, 'Video not found')
    }

    if (!oldVideo.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }

    const { title, description, category, tags } = req.body

    const updatePayload = {}
    if (title && title.trim()) updatePayload.title = title.trim()
    if (description && description.trim()) updatePayload.description = description.trim()
    if (category) updatePayload.category = category
    if (tags) {
        updatePayload.tags = Array.isArray(tags)
            ? tags
            : tags.split(',').map((t) => t.trim()).filter(Boolean)
    }

    // Handle optional new thumbnail upload
    const thumbnailLocalPath = req.file?.path
    let uploadedThumbnail = null

    if (thumbnailLocalPath) {
        uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (uploadedThumbnail?.url) {
            updatePayload.thumbnail = uploadedThumbnail.url
            updatePayload.thumbnailPublicId = uploadedThumbnail.public_id
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatePayload },
        { new: true }
    )

    if (!updatedVideo) {
        if (uploadedThumbnail?.public_id) {
            await deleteFromCloudinary(uploadedThumbnail.public_id)
        }
        throw new ApiError(500, 'Failed to update video')
    }

    // If new thumbnail was uploaded successfully, delete old one
    if (uploadedThumbnail && oldVideo.thumbnailPublicId) {
        await deleteFromCloudinary(oldVideo.thumbnailPublicId)
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, 'Video updated successfully')
    )
})

// Delete video and clean up associated database references and cloud assets
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to delete this video')
    }

    // Delete the video document
    await Video.findByIdAndDelete(videoId)

    // Clean up Cloudinary assets
    if (video.videoFilePublicId) await deleteFromCloudinary(video.videoFilePublicId)
    if (video.thumbnailPublicId) await deleteFromCloudinary(video.thumbnailPublicId)

    // Cascade clean up comments, likes, and remove from all playlists & watch histories
    await Promise.allSettled([
        Comment.deleteMany({ video: videoId }),
        Like.deleteMany({ video: videoId }),
        Playlist.updateMany({ videos: videoId }, { $pull: { videos: videoId } }),
        User.updateMany({ watchHistory: videoId }, { $pull: { watchHistory: videoId } })
    ])

    return res.status(200).json(
        new ApiResponse(200, {}, 'Video and associated data deleted successfully')
    )
})

// Toggle video publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`
        )
    )
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    getRelatedVideos,
    getTrendingVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
