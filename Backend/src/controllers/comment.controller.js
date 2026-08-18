import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"

// Get all comments for a video with populated owner and isLiked flag
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const videoExists = await Video.exists({ _id: videoId })
    if (!videoExists) {
        throw new ApiError(404, 'Video not found')
    }

    const { page = 1, limit = 20 } = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (pageNumber < 1 || isNaN(pageNumber)) {
        throw new ApiError(400, 'Invalid page number')
    }

    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
        throw new ApiError(400, 'Limit must be between 1 and 100')
    }

    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

    const commentPipeline = [
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
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
                foreignField: 'comment',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likesCount: { $size: '$likes' },
                isLiked: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [currentUserId, null] },
                                { $in: [currentUserId, '$likes.likedBy'] }
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
                likes: 0
            }
        }
    ]

    const options = {
        page: pageNumber,
        limit: limitNumber,
        customLabels: { docs: 'comments' }
    }

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate(commentPipeline),
        options
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            comments.comments?.length ? 'Comments fetched successfully' : 'No comments found'
        )
    )
})

// Post a new comment
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new ApiError(400, 'Comment content should not be empty')
    }

    const { videoId } = req.params
    validateMongoId(videoId, 'Video ID')

    const videoExists = await Video.exists({ _id: videoId })
    if (!videoExists) {
        throw new ApiError(404, 'Video not found')
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user?._id
    })

    const populatedComment = await Comment.findById(comment._id).populate('owner', 'fullName username avatar')

    return res.status(201).json(
        new ApiResponse(
            201,
            populatedComment,
            'Comment posted successfully'
        )
    )
})

// Update comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    validateMongoId(commentId, 'Comment ID')

    const oldComment = await Comment.findById(commentId)

    if (!oldComment) {
        throw new ApiError(404, 'Comment not found')
    }

    if (!oldComment.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to edit this comment')
    }

    const { editedContent } = req.body

    if (!editedContent || typeof editedContent !== 'string' || editedContent.trim() === '') {
        throw new ApiError(400, 'Comment content should not be empty')
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: editedContent.trim() } },
        { new: true }
    ).populate('owner', 'fullName username avatar')

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            'Comment updated successfully'
        )
    )
})

// Delete comment and clean up likes
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    validateMongoId(commentId, 'Comment ID')

    const oldComment = await Comment.findById(commentId)

    if (!oldComment) {
        throw new ApiError(404, 'Comment not found')
    }

    if (!oldComment.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to delete this comment')
    }

    await Comment.findByIdAndDelete(commentId)
    await Like.deleteMany({ comment: commentId })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            'Comment deleted successfully'
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}