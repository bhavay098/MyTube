import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, 'Name and description are required')
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, playlist, 'Playlist created successfully')
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    validateMongoId(userId, 'User ID')

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    const playlists = await Playlist.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: 'videos',
            select: 'thumbnail title duration views createdAt owner',
            populate: {
                path: 'owner',
                select: 'fullName username avatar'
            }
        })

    return res.status(200).json(
        new ApiResponse(200, playlists, 'Playlists fetched successfully')
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    validateMongoId(playlistId, 'Playlist ID')

    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: 'videos',
            select: 'thumbnail title duration views createdAt owner videoFile isPublished',
            populate: {
                path: 'owner',
                select: 'fullName username avatar'
            }
        })
        .populate('owner', 'fullName username avatar')

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, 'Playlist fetched successfully')
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    validateMongoId(playlistId, 'Playlist ID')
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorized to modify this playlist')
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true }
    ).populate({
        path: 'videos',
        select: 'thumbnail title duration views createdAt owner',
        populate: {
            path: 'owner',
            select: 'fullName username avatar'
        }
    })

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, 'Video added to playlist successfully')
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    validateMongoId(playlistId, 'Playlist ID')
    validateMongoId(videoId, 'Video ID')

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorized to modify this playlist')
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    ).populate({
        path: 'videos',
        select: 'thumbnail title duration views createdAt owner',
        populate: {
            path: 'owner',
            select: 'fullName username avatar'
        }
    })

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, 'Video removed from playlist successfully')
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    validateMongoId(playlistId, 'Playlist ID')

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorized to modify this playlist')
    }

    await playlist.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, {}, 'Playlist deleted successfully')
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    validateMongoId(playlistId, 'Playlist ID')

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, 'Not authorized to modify this playlist')
    }

    const { name, description } = req.body

    if (!name?.trim() && !description?.trim()) {
        throw new ApiError(400, 'At least one field is required to update')
    }

    if (name?.trim()) playlist.name = name.trim()
    if (description?.trim()) playlist.description = description.trim()

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200, playlist, 'Playlist updated successfully')
    )
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