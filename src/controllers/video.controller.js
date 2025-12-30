import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import mongoose from "mongoose"


// Function to get all videos with filtering, sorting, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query   // Extract query parameters from the request. Set default values: page=1, limit=10 if not provided

    const pageNumber = parseInt(page, 10)   // Convert page and limit to numbers (they come as strings from URL)
    const limitNumber = parseInt(limit, 10)

    // Validate page number - must be 1 or greater
    if (pageNumber < 1 || isNaN(pageNumber)) {
        throw new ApiError(400, 'Invalid page number')
    }

    // Validate limit - must be between 1 and 100
    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
        throw new ApiError(400, 'Limit must be between 1 and 100')
    }

    const skip = (pageNumber - 1) * limitNumber   // Calculate how many videos to skip for pagination. Example: page 2 with limit 10 means skip first 10 videos

    const matchCondition = {}   // Build the filter conditions for MongoDB query

    // If userId is provided, filter videos by that user
    if (userId) {
        validateMongoId(userId, 'User ID')
        matchCondition.owner = new mongoose.Types.ObjectId(userId)   // Convert userId string to MongoDB ObjectId format
    }

    // If search query is provided, search in title OR description
    if (query) {
        matchCondition.$or = [
            // $regex searches for the text in the query variable. It looks for that text anywhere in the title field (beginning, middle, or end). 'i' makes it case-insensitive
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ]
    }

    matchCondition.isPublished = true   // Only show published videos (not drafts)

    const sortOptions = {}   // Build sorting options

    // If sortBy is provided, sort by the specified field
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'asc' ? 1 : -1   // 'asc' = ascending (1), anything else = descending (-1)
    } else {
        sortOptions.createdAt = -1   // Default: sort by creation date, newest first
    }

    // MongoDB aggregation pipeline to fetch videos
    const videos = await Video.aggregate([
        {
            $match: matchCondition   // Step 1: Filter videos based on our conditions
        },
        {
            $sort: sortOptions   // Step 2: Sort the filtered videos
        },
        {
            $skip: skip   // Step 3: Skip videos for pagination (like OFFSET in SQL)
        },
        {
            $limit: limitNumber   // Step 4: Limit the number of results (like LIMIT in SQL)
        },
        {
            $lookup: {   // Step 5: Join with users collection to get owner details
                from: 'users',   // Collection to join with
                foreignField: '_id',   // Field in users collection
                localField: 'owner',   // Field in videos collection
                as: 'owner',   // Name for the joined data
                pipeline: [   // sub pipeline
                    {
                        $project: {   // Only include specific user fields (not password, etc.)
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$owner'   // Step 6: Convert owner from array to single object. $lookup returns an array, but we only have one owner per video
        }
    ])

    // If no videos found, return empty response with pagination info
    if (!videos || videos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    videos: [],
                    pagination: {
                        totalVideos: 0,
                        totalPages: 0,
                        currentPage: pageNumber,
                        limit: limitNumber,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                },
                'No videos found'
            ))
    }

    const totalVideos = await Video.countDocuments(matchCondition)   // Count total videos matching our filters (for pagination)
    const totalPages = Math.ceil(totalVideos / limitNumber)   // Calculate total pages needed. Example: 25 videos with limit 10 = 3 pages

    // Send successful response with videos and pagination info
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                videos: videos,
                pagination: {
                    totalVideos,   // Total count of videos
                    totalPages,   // Total number of pages
                    currentPage: pageNumber,   // Current page number
                    limit: limitNumber,   // Videos per page
                    hasNextPage: pageNumber < totalPages,   // Is there a next page?
                    hasPrevPage: pageNumber > 1   // Is there a previous page?
                }
            },
            'Videos fetched successfully'
        ))
})

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const { title, description } = req.body   // Extract title and description from request body

    if (!title || !description) {   // Validate that both title and description are provided
        throw new ApiError(400, 'All fields are required')
    }

    // Extract video file and thumbnail paths from uploaded files. req.files contains multiple files uploaded via multer
    // We're accessing the first file [0] from both 'videoFile' and 'thumbnail' arrays
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {   // Check if both files were uploaded
        throw new ApiError(400, 'Both video and thumbnail files are required')
    }

    // Upload video file & thumbnail to Cloudinary and get response with URL and metadata
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {   // Verify both uploads were successful by checking if URLs exist
        throw new ApiError(400, 'Error while uploading')
    }

    // Create new video document in database with all necessary fields
    const video = await Video.create({
        videoFile: uploadedVideo.url,   // Cloudinary URL for the video
        videoFilePublicId: uploadedVideo.public_id,   // Cloudinary public ID (needed for deletion)
        thumbnail: uploadedThumbnail.url,   // Cloudinary URL for thumbnail
        thumbnailPublicId: uploadedThumbnail.public_id,   // Cloudinary public ID (needed for deletion)
        title,   // Video title from request
        description,   // Video description from request
        duration: uploadedVideo.duration,   // Video duration from Cloudinary metadata
        owner: req.user?._id   // User ID from authenticated user (via middleware)
    })

    if (!video) {   // checking whether video dociment exists in DB
        throw new ApiError(500, "failed to publish");
    }

    // Return success response with created video data
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            video,
            'Video published successfully'
        ))
})

// Function to get a single video by its ID
const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id

    const { videoId } = req.params   // Extract videoId from URL parameters (e.g., /videos/:videoId)
    validateMongoId(videoId, 'Video ID')   // Validate videoId format and existence in req.params before proceeding

    // Find the video AND increment its view count in one operation. This is more efficient than separate find and update operations
    const video = await Video.findOneAndUpdate(
        {   // Search conditions:
            _id: videoId,   // Find video with this specific ID
            isPublished: true   // Only get published videos (not drafts)
        },
        {   // Update operation:
            $inc: { views: 1 }   // Increment the views field by 1. $inc is MongoDB's increment operator
        },
        {   // Options:
            new: true,   // Return the UPDATED document (after incrementing views). Without this, it returns the OLD document
            runValidators: true   // Run schema validation rules on the update
        }
    )
        // Join with users collection to get owner details. 'owner' is the field to populate. fullName username avatar' are the specific fields we want from the user
        .populate('owner', 'fullName username avatar')
        // Select only specific fields to return. This limits the data sent to the client (better performance & security). Not sending unnecessary fields like internal timestamps, etc.
        .select('videoFile thumbnail title description duration views isPublished owner')

    if (!video) {   // Check if video exists in database or isn't published. findOneAndUpdate returns null if no document matches the conditions
        throw new ApiError(404, 'Video not found')
    }

    // If user is logged in (authenticated), add video to their watch history
    if (req.user) {   // req.user exists only if user is authenticated (set by auth middleware)
        await User.findByIdAndUpdate(
            req.user._id,   // Find the logged-in user
            { $addToSet: { watchHistory: videoId } }   // $addToSet adds videoId to watchHistory array only if it's not already there (prevents duplicates)
        )
    }

    // Send successful response with the video data
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,   // The video object with owner details
            'Video fetched successfully'
        ))
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail

    const { videoId } = req.params   // Extract videoId from URL parameters (e.g., /videos/:videoId)
    validateMongoId(videoId, 'Video ID')   // Validate videoId format and existence in req.params before proceeding

    // Check if video exists in database before proceeding. This prevents wasting resources on non-existent videos (fail fast approach)
    const oldVideo = await Video.findById(videoId)

    if (!oldVideo) {
        throw new ApiError(404, 'Video not found')
    }

    // Check if the logged-in user is the owner of the video (security check to prevent unauthorized updates)
    if (!oldVideo.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }

    const { title, description, } = req.body   // Extract title and description from request body

    if (!title || !description) {   // Validate that both title and description are provided
        throw new ApiError(400, 'All fields are required')
    }

    // Extract thumbnail file path from uploaded file. req.file contains single file uploaded via multer
    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {   // Check if thumbnail file was uploaded
        throw new ApiError(400, 'Thumbnail file is missing')
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)   // Upload new thumbnail to Cloudinary and get response with URL and metadata

    if (!thumbnail?.url) {   // Verify upload was successful by checking if URL exists
        throw new ApiError(400, 'Error while uploading thumbnail')
    }

    // Update video document in database with new data
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {   // $set operator updates only specified fields
                title,   // New title
                description,   // New description
                thumbnail: thumbnail.url,   // New Cloudinary thumbnail URL
                thumbnailPublicId: thumbnail.public_id   // New Cloudinary public ID
            }
        },
        { new: true }   // { new: true } option returns the updated document instead of the old one
    )

    if (!video) {   // If update failed, delete the newly uploaded thumbnail to avoid orphaned files
        await deleteFromCloudinary(thumbnail.public_id)
        throw new ApiError(500, 'Failed to update video')
    }

    // Delete old thumbnail from Cloudinary after successful update. This keeps cloud storage clean and prevents orphaned files
    // Done after update to ensure we don't lose the old thumbnail if update fails
    await deleteFromCloudinary(oldVideo.thumbnailPublicId)

    // Return success response with updated video data
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            'Video updated successfully'
        ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video

    const { videoId } = req.params   // Extract videoId from URL parameters (e.g., /videos/:videoId)
    validateMongoId(videoId, 'Video ID')   // Validate videoId format and existence in req.params before proceeding

    const video = await Video.findById(videoId)   // fetching video to be deleted from videoId

    // Check if video existed in database. If video is null, it means no document was found with that ID
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    // Check if the logged-in user is the owner of the video (security check to prevent unauthorized updates)
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }

    // Delete the video document from the database. This removes all video metadata (title, description, etc.)
    await Video.findByIdAndDelete(videoId)

    // Delete video file & thumbnail from Cloudinary using their public ID. This cleans up cloud storage and prevents orphaned files
    await deleteFromCloudinary(video.videoFilePublicId)
    await deleteFromCloudinary(video.thumbnailPublicId)

    // Return success response with empty data object. Empty object is returned since the video no longer exists
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            'Video deleted successfully'
        ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params   // Extract videoId from URL parameters (e.g., /videos/:videoId/toggle-publish)
    validateMongoId(videoId, 'Video ID')   // Validate videoId format and existence in req.params before proceeding

    const video = await Video.findById(videoId)   // Find video by ID in DB to get current publish status

    if (!video) {   // Check if video exists in database
        throw new ApiError(404, 'Video not found')
    }

    // Check if the logged-in user is the owner of the video (security check to prevent unauthorized updates)
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }

    video.isPublished = !video.isPublished   // Toggle the isPublished field (true becomes false, false becomes true). ! operator inverts the boolean value
    await video.save()   // Save the updated video document to database. Using .save() instead of findByIdAndUpdate to work with the existing document

    // Return success response with updated video data
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`   // Dynamic message based on new publish status using ternary operator
        ))
})


export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}