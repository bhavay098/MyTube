import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist

    const { name, description } = req.body   // Extract name and description from the request body

    // Validate that both fields are provided and not just whitespace
    // .trim() removes leading/trailing spaces
    if (!name?.trim() || !description?.trim()) {   // The ?. (optional chaining) safely handles undefined/null values
        throw new ApiError(400, 'All fields are required')
    }

    // Create a new playlist in the database
    // owner is automatically set from the authenticated user's ID
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id  // req.user is added by authentication middleware
    })

    // Send success response with 201 (Created) status code. Return the newly created playlist object
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            playlist,
            'Playlist created successfully'
        ))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    const { userId } = req.params   // Extract userId from URL parameters (e.g., /users/:userId/playlists)
    validateMongoId(userId, 'User ID')   // Validate that userId is a valid MongoDB ObjectId format

    // Check if the user exists in the database
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    // Find all playlists owned by this user
    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 })   // .sort({ createdAt: -1 }) sorts by newest first (descending order)

    // Send success response with the array of playlists. Returns empty array [] if user has no playlists
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlists,
            'Playlists fetched successfully'
        ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id

    const { playlistId } = req.params   // Extract playlistId from URL parameters (e.g., /playlists/:playlistId)
    validateMongoId(playlistId, 'Playlist ID')   // Validate that playlistId is a valid MongoDB ObjectId format

    // Find the playlist and populate related data
    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: 'videos',   // Populate the 'videos' array with full video documents
            select: 'thumbnail title duration owner',   // Only include these fields from videos
            populate: {   // Nested populate: get owner details for each video
                path: 'owner',
                select: 'fullName'   // Only include fullName from the owner/user document
            }
        })

    // Check if playlist exists
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    // Send success response with populated playlist data. Response includes: playlist info + video details (thumbnail, title, duration) + video owner names
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            'Playlist fetched successfully'
        ))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params   // Extract playlistId and videoId from URL parameters (e.g., /playlists/:playlistId/videos/:videoId)

    // Validate that both IDs are valid MongoDB ObjectId formats
    validateMongoId(playlistId, 'Playlist ID')
    validateMongoId(videoId, 'Video ID')

    // Check if the video exists in the database
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    // Check if the playlist exists in the database
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    // Authorization check: ensure the current user owns this playlist
    if (!playlist.owner.equals(req.user._id)) {   // .equals() is used to compare MongoDB ObjectIds
        throw new ApiError(403, 'Not authorised to modify this playlist')
    }

    // Add the video to the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },   // $addToSet: adds videoId ONLY if it doesn't already exist (prevents duplicates)
        { new: true }   // { new: true }: returns the updated document instead of the old one
    )

    // Send success response with the updated playlist
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedPlaylist,
            'Video added to playlist successfully'
        ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist

    const { playlistId, videoId } = req.params   // Extract playlistId and videoId from URL parameters (e.g., DELETE /playlists/:playlistId/videos/:videoId)

    // Validate that both IDs are valid MongoDB ObjectId formats
    validateMongoId(playlistId, 'Playlist ID')
    validateMongoId(videoId, 'Video ID')

    // Check if the video exists in the database
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    // Check if the playlist exists in the database
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    // Authorization check: ensure the current user owns this playlist. Only the playlist owner can remove videos from it
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorised to modify this playlist')
    }

    // Remove the video from the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },   // $pull: removes the videoId from the videos array (even if it appears multiple times)
        { new: true }   // { new: true }: returns the updated document instead of the old one
    )

    // Send success response with the updated playlist. If the video wasn't in the playlist, this still succeeds (no error)
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedPlaylist,
            'Video removed from playlist successfully'
        ))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist

    const { playlistId } = req.params   // Extract playlistId from URL parameters (e.g., DELETE /playlists/:playlistId)
    validateMongoId(playlistId, 'Playlist ID')   // Validate that playlistId is a valid MongoDB ObjectId format

    const playlist = await Playlist.findById(playlistId)   // Fetch the playlist from the database

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    // Authorization check: ensure the current user owns this playlist. Only the playlist owner can delete it
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorised to modify this playlist')
    }

    await playlist.deleteOne()   // Delete the playlist from the database. deleteOne() removes the document that was fetched

    // Send success response with empty object. Empty {} indicates the resource no longer exists after deletion
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            'Playlist deleted successfully'
        ))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist

    const { playlistId } = req.params   // Extract playlistId from URL parameters (e.g., PATCH /playlists/:playlistId)
    validateMongoId(playlistId, 'Playlist ID')   // Validate that playlistId is a valid MongoDB ObjectId format

    const playlist = await Playlist.findById(playlistId)   // Fetch the playlist from the database

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    // Authorization check: ensure the current user owns this playlist. Only the playlist owner can update it
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorised to modify this playlist')
    }

    const { name, description } = req.body   // Extract name and description from request body

    // Validate that at least one field is provided for update
    if (!name?.trim() && !description?.trim()) {   // Using AND (&&) means BOTH must be empty to throw error
        throw new ApiError(400, 'At least one field is required')
    }

    // Update name only if it's provided and not empty after trimming
    if (name?.trim()) {
        playlist.name = name
    }

    // Update description only if it's provided and not empty after trimming
    if (description?.trim()) {
        playlist.description = description
    }

    await playlist.save()   // Save the updated playlist to the database. Mongoose will only update the fields that were modified

    // Send success response with the updated playlist
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            'Playlist updated successfully'
        ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}