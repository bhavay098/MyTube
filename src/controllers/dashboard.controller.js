import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user?._id;   // Extract the logged-in user's ID (channel owner ID)

    // Aggregation pipeline to calculate video statistics
    const stats = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) }   // Stage 1: Filter videos that belong to this channel
        },
        {
            $lookup: {   // Stage 2: Join with 'likes' collection to get all likes for each video
                from: 'likes',           // Collection to join
                localField: '_id',       // Video's _id field
                foreignField: 'video',   // Like's video reference field
                as: 'likes',             // Store results in 'likes' array
                pipeline: [   // Sub-pipeline: Only fetch likedBy field to reduce data transfer
                    { $project: { likedBy: 1 } }
                ]
            }
        },
        {
            $group: {   // Stage 3: Group all videos together and calculate totals
                _id: null,                        // Group all documents into one
                totalVideos: { $sum: 1 },         // Count number of videos
                totalViews: { $sum: '$views' },   // Sum all video views
                totalLikes: { $sum: { $size: '$likes' } }   // Count likes per video using $size, then sum across all videos
            }
        }
    ]);

    // Query the Subscription collection to count total subscribers. Counts documents where this channel is the subscribed channel
    const totalSubscribers = await Subscription.countDocuments({   // countDocuments returns 0 automatically if no subscribers exist
        channel: channelId
    });

    // Safely extract stats from aggregation result. If the user has no videos, stats array will be empty
    // Uses optional chaining (?.) and default values (|| 0) to handle empty results
    const channelStats = {
        totalVideos: stats[0]?.totalVideos || 0,   // Default to 0 if no videos
        totalViews: stats[0]?.totalViews || 0,     // Default to 0 if no views
        totalLikes: stats[0]?.totalLikes || 0,     // Default to 0 if no likes
        totalSubscribers                           // Already returns 0 if no subscribers
    };

    // Send success response with channel statistics
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channelStats,
            'Channel stats fetched successfully'
        ));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    // Extract query parameters with default values
    // page: which page to fetch (default: 1)
    // limit: number of videos per page (default: 10)
    // sortType: sort order - 'asc' (oldest first) or 'desc' (newest first)
    const { page = 1, limit = 10, sortType = 'desc' } = req.query;

    const pageNumber = parseInt(page, 10);   // Convert page string to integer (base 10)
    const limitNumber = parseInt(limit, 10);   // Convert limit string to integer (base 10)

    // Validate page number
    if (pageNumber < 1 || isNaN(pageNumber)) {   // Must be a positive number and not NaN (Not a Number)
        throw new ApiError(400, 'Invalid page number');
    }

    // Validate limit
    if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {   // Must be between 1 and 100 to prevent excessive data fetching
        throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    // Determine MongoDB sort direction
    // 'asc'  -> oldest first  (1). 'desc' -> newest first (-1)
    const sortDirection = sortType === 'asc' ? 1 : -1;   // Any invalid value automatically defaults to descending

    // Build aggregation pipeline to fetch and transform video data
    const videoPipeline = [
        {
            $match: { owner: new mongoose.Types.ObjectId(req.user?._id) }   // Stage 1: Filter videos that belong to the logged-in user's channel
        },
        {
            // Stage 2: Sort videos by creation date
            $sort: { createdAt: sortDirection }   // Uses sortDirection to control ascending/descending order
        },
        {
            // Stage 3: Exclude sensitive/unnecessary fields from response
            // 0 means exclude, 1 means include
            $project: {
                videoFilePublicId: 0,   // Don't send Cloudinary video ID
                thumbnailPublicId: 0,   // Don't send Cloudinary thumbnail ID
                description: 0,         // Exclude description for list view
                owner: 0                // Don't send owner info (redundant)
            }
        }
    ];

    // Configure pagination options for aggregatePaginate
    const options = {
        page: pageNumber,                  // Current page number
        limit: limitNumber,                // Videos per page
        customLabels: { docs: 'videos' }   // Rename 'docs' field to 'videos' in response
    };

    // Execute the aggregation pipeline with pagination
    const videos = await Video.aggregatePaginate(   // aggregatePaginate automatically adds skip/limit and returns paginated results
        Video.aggregate(videoPipeline),
        options
    );

    // If no videos exist for this channel, return empty result gracefully
    if (!videos.videos || videos.videos.length === 0) {
        return res   // Return response with empty videos array and pagination metadata
            .status(200)
            .json(new ApiResponse(
                200,
                videos,   // Still includes pagination info even when empty
                'No videos found'
            ));
    }

    // Return successful response with videos and pagination data
    // Response includes: videos array, totalDocs, totalPages, hasNextPage, etc.
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            videos,
            'Videos fetched successfully'
        ));
});

export {
    getChannelStats,
    getChannelVideos
}