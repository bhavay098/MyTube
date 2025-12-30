import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    const { videoId } = req.params   // Extract videoId from the URL parameters (e.g., /api/videos/:videoId/comments)
    validateMongoId(videoId, 'Video ID')   // Validate that the videoId is a valid MongoDB ObjectId format

    const videoExists = await Video.exists({ _id: videoId })
    if (!videoExists) {
        throw new ApiError(404, 'Video not found')
    }

    const { page = 1, limit = 10 } = req.query   // Get pagination parameters from query string

    // Convert page and limit from strings to numbers. 10 means we're using the decimal number system (base-10: 0-9). It is called the radix or base
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (pageNumber < 1 || isNaN(pageNumber)) {   // Validate page number - must be a positive number
        throw new ApiError(400, 'Invalid page number')
    }

    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {   // Validate limit - must be between 1 and 100 to prevent excessive data requests
        throw new ApiError(400, 'Limit must be between 1 and 100')
    }

    const commentPipeline = [   // MongoDB aggregation pipeline to fetch and process comments
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }   // Stage 1: Filter comments to only get those belonging to this video
        },
        {
            $sort: { createdAt: -1 }   // Stage 2: Sort comments by creation date, newest first (-1 means descending)
        },
        {
            $lookup: {   // Stage 3: Join with the 'users' collection to get comment owner details
                from: 'users',   // Collection to join with
                localField: 'owner',   // Field from comments collection
                foreignField: '_id',   // Field from users collection to match
                as: 'owner',   // Name for the resulting array
                pipeline: [   // Sub-pipeline: Only include username and avatar fields
                    {
                        $project: {   // This reduces the amount of data returned
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: '$owner' }   // Stage 4: Convert owner from array to single object. $lookup returns an array, but we only need one owner per comment
    ]

    const options = {   // Configure pagination options
        page: pageNumber,   // Which page to return
        limit: limitNumber,   // How many items per page
        customLabels: { docs: 'comments' }   // Rename 'docs' field to 'comments' in response
    }

    // Execute the aggregation pipeline with pagination
    const comments = await Comment.aggregatePaginate(   // aggregatePaginate automatically adds skip/limit and returns paginated results
        Comment.aggregate(commentPipeline),
        options
    )

    if (!comments.comments || comments.comments.length === 0) {   // Check if any comments were found
        return res   // Return success response even if no comments found (not an error)
            .status(200)
            .json(new ApiResponse(
                200,
                comments,
                'No comments found'
            ))
    }

    // Return success response with the fetched comments
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            comments,
            'Comments fetched successfully'
        ))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content } = req.body   // Extract the comment content from the request body

    // Validate the content before saving to database:
    // 1. content exists (not null/undefined)
    // 2. content is not just empty spaces (trim() removes whitespace from both ends)
    // 3. content is actually a string type (prevents sending numbers, objects, etc.)
    if (!content || content.trim() === '' || typeof content !== 'string') {
        throw new ApiError(400, 'content should not be empty')
    }

    const { videoId } = req.params   // Extract videoId from the URL parameters (e.g., /api/videos/:videoId/comments)
    validateMongoId(videoId, 'Video ID')   // Validate that the videoId is a valid MongoDB ObjectId format

    const comment = await Comment.create({   // Create a new comment document in the MongoDB database
        content: content,   // The actual comment text
        video: videoId,   // Reference to which video this comment belongs to
        owner: req.user?._id   // The user ID of who posted the comment (from authentication middleware). The "?" is optional chaining - safely accesses _id even if req.user is undefined
    })

    if (!comment) {   // Check if comment creation failed
        throw new ApiError(500, "failed to post comment");
    }

    // Return success response with status 201 (Created)
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            comment,
            'Comment posted successfully'
        ))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params   // Extract commentId from the URL parameters (e.g., /api/comments/:commentId)
    validateMongoId(commentId, 'Comment ID')   // Validate that the commentId is a valid MongoDB ObjectId format

    // Fetch the existing comment from the database to check if it exists. We need the old comment to verify ownership before allowing updates
    const oldComment = await Comment.findById(commentId)

    if (!oldComment) {   // Check if the comment exists in the database
        throw new ApiError(404, 'Comment not found')
    }

    // SECURITY CHECK: Verify that the logged-in user owns this comment
    // .equals() is used to compare MongoDB ObjectIds (can't use === with ObjectIds). This prevents users from editing other people's comments
    if (!oldComment.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to edit this comment')
    }

    const { editedContent } = req.body   // Extract the new/edited content from the request body

    // Validate the edited content before updating
    // 1. editedContent exists (not null/undefined)
    // 2. editedContent is not just empty spaces (trim() removes whitespace)
    // 3. editedContent is a string type (not a number, object, etc.)
    if (!editedContent || editedContent.trim() === '' || typeof editedContent !== 'string') {
        throw new ApiError(400, 'content should not be empty')
    }

    // Update the comment in the database
    const comment = await Comment.findByIdAndUpdate(
        commentId,                                    // Which comment to update (by ID)
        { $set: { content: editedContent.trim() } },  // What to update - set content to new value (trimmed)
        { new: true }                                 // Options: return the UPDATED document (not the old one)
    )

    // Return success response with status 200 (OK). Send back the updated comment data
    return res
        .status(200)
        .json(new ApiResponse(
            200,                                // Status code (200 = OK/Success)
            comment,                            // The updated comment data
            'Comment updated successfully'      // Success message
        ))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params   // Extract commentId from the URL parameters (e.g., /api/comments/:commentId)
    validateMongoId(commentId, 'Comment ID')   // Validate that the commentId is a valid MongoDB ObjectId format

    // Fetch the existing comment from the database. We need to retrieve it first to check if the comment exists and who owns the comment (for authorization)
    const oldComment = await Comment.findById(commentId)

    if (!oldComment) {   // If comment was already deleted or never existed, return 404 error
        throw new ApiError(404, 'Comment not found')
    }

    // SECURITY CHECK: Verify that the logged-in user owns this comment. Only the person who created the comment should be able to delete it
    if (!oldComment.owner.equals(req.user._id)) {   // .equals() is the proper way to compare MongoDB ObjectIds (don't use ===)
        throw new ApiError(403, 'You are not authorized to delete this comment')
    }

    // Permanently delete the comment from the database
    // findByIdAndDelete() finds the comment by ID and removes it in one operation. It returns the deleted document, or null if something goes wrong
    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {   // Check if the deletion operation failed
        throw new ApiError(500, 'Failed to delete comment')
    }

    // Return success response with status 200 (OK)
    return res
        .status(200)
        .json(new ApiResponse(
            200,                                // Status code (200 = Success)
            {},                                 // Empty object - no data to return since comment is deleted
            'Comment deleted successfully'      // Success message
        ))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}