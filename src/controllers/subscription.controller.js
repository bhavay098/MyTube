import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    const { channelId } = req.params   // Get the channel ID from the URL parameters
    validateMongoId(channelId, 'Channel ID')   // Validate that the channelId is a valid MongoDB ObjectId format

    // Check if the channel (user) exists in the database
    const channel = await User.exists({ _id: channelId })
    if (!channel) {
        throw new ApiError(404, 'Channel not found')
    }

    // Check if the user is already subscribed to this channel. Search for an existing subscription document with current user as subscriber
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,   // Current logged-in user
        channel: channelId          // Channel they want to subscribe/unsubscribe
    })

    // If subscription exists, unsubscribe (delete the subscription)
    if (existingSubscription) {
        await existingSubscription.deleteOne()   // Remove the subscription document from database

        // Send success response for unsubscribe action
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                'Channel unsubscribed successfully'
            ))
    }

    // If no existing subscription found, create a new one (subscribe)
    const subscription = await Subscription.create({
        subscriber: req.user._id,   // Current logged-in user
        channel: channelId   // Channel they're subscribing to
    })

    // Send success response for subscribe action with subscription data
    return res
        .status(201)   // 201 = Created (new resource)
        .json(new ApiResponse(
            201,
            subscription,
            'Channel subscribed successfully'
        ))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params   // Get the channel ID from the URL parameters
    validateMongoId(channelId, 'Channel ID')   // Validate that the channelId is a valid MongoDB ObjectId format

    // Check if the channel (user) exists in the database
    const channel = await User.exists({ _id: channelId })
    if (!channel) {
        throw new ApiError(404, 'Channel not found')
    }

    // Find all subscriptions where this channel is being subscribed to
    // .populate() fetches the actual subscriber details from the User collection
    const subscribers = await Subscription.find({ channel: channelId })
        .populate('subscriber', 'username fullName avatar')   // We only get specific fields: username, fullName, and avatar
        .sort({ createdAt: -1 })   // .sort() orders by newest subscribers first (createdAt in descending order)

    // Send success response with subscriber data
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                totalSubscribers: subscribers.length,   // Count of total subscribers
                subscribers   // Array of subscriber objects
            },
            'Subscribers fetched successfully'
        ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params   // Get the subscriber ID from the URL parameters
    validateMongoId(subscriberId, 'Subscriber ID')   // Validate that the subscriberId is a valid MongoDB ObjectId format

    // Check if the user exists in the database
    const user = await User.exists({ _id: subscriberId })
    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    // Authorization check: ensure the logged-in user can only view their own subscriptions
    // Compare the logged-in user's ID with the requested subscriberId
    if (!req.user._id.equals(subscriberId)) {   // .equals() is MongoDB's method to compare ObjectIds
        throw new ApiError(403, "Not authorised to view this user's subscriptions")
    }

    // Find all subscriptions where this user is the subscriber
    // .populate() fetches the actual channel details from the User collection
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate('channel', 'username fullName avatar')   // We only get specific fields: username, fullName, and avatar
        .sort({ createdAt: -1 })   // .sort() orders by newest subscriptions first (createdAt in descending order)

    // Send success response with subscription data
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                totalSubscriptions: subscriptions.length,   // Count of total subscriptions
                subscriptions   // Array of subscribed channels
            },
            'Subscriptions fetched successfully'
        ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}