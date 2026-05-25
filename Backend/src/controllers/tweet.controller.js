import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { validateMongoId } from "../utils/validateMongoId.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body   // Extract the content from the request body

    // 1. Check if content exists (not null/undefined)
    // 2. Check if content is a string type
    // 3. Check if content is not just whitespace using trim()
    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new ApiError(400, 'Content should not be empty')
    }

    // Create a new tweet in the database
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id   // owner is set to the currently logged-in user's ID from req.user
    })

    // Send success response with:
    return res
        .status(201)   // 201 status code (Created)
        .json(new ApiResponse(
            201,
            tweet,   // The created tweet object
            'Tweet posted successfully'   // Success message
        ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params   // Extract userId from the URL parameters (e.g., /tweets/user/:userId)
    validateMongoId(userId, 'User ID')   // Validate that userId is a valid MongoDB ObjectId format

    // Check if the user exists in the database
    const userExists = await User.exists({ _id: userId })   // exists() returns true/false and is more efficient than findById()
    if (!userExists) {
        throw new ApiError(404, 'User not found')
    }

    // Find all tweets where the owner matches the userId
    // populate() adds the user's username and avatar to each tweet
    const tweets = await Tweet.find({ owner: userId })
        .populate('owner', 'username avatar')   // This replaces the owner ID with actual user details

    // Check if the user has any tweets
    if (tweets.length === 0) {

        // Return empty array with appropriate message if no tweets found
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                tweets,
                'No tweets found'
            ))
    }

    // Return the tweets array with success message
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweets,
            'Tweets fetched successfully'
        ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params   // Extract tweetId from the URL parameters (e.g., /tweets/:tweetId)
    validateMongoId(tweetId, 'Tweet ID')   // Validate that tweetId is a valid MongoDB ObjectId format

    const oldTweet = await Tweet.findById(tweetId)   // Fetch the existing tweet from the database

    // Check if the tweet exists
    if (!oldTweet) {
        throw new ApiError(404, 'Tweet not found')
    }

    // Authorization check: Verify that the logged-in user is the owner of the tweet
    // This prevents users from editing other people's tweets
    if (!oldTweet.owner.equals(req.user._id)) {   // .equals() is used to compare MongoDB ObjectIds properly
        throw new ApiError(403, 'You are not authorized to edit this tweet')
    }

    const { editedContent } = req.body   // Extract the new content from the request body

    // 1. Check if editedContent exists
    // 2. Check if it's a string type
    // 3. Check if it's not just whitespace
    if (!editedContent || typeof editedContent !== 'string' || editedContent.trim() === '') {
        throw new ApiError(400, 'Content should not be empty')
    }

    // Update the tweet in the database
    // .trim(): removes leading/trailing whitespace before saving
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: editedContent.trim() } },   // $set: updates only the content field
        { new: true }   // { new: true }: returns the updated document instead of the old one
    )

    // Send success response with:
    return res
        .status(200)   // 200 status code (OK)
        .json(new ApiResponse(
            200,
            updatedTweet,   // The updated tweet object
            'Tweet updated successfully'   // Success message
        ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params   // Extract tweetId from the URL parameters (e.g., /tweets/:tweetId)
    validateMongoId(tweetId, 'Tweet ID')   // Validate that tweetId is a valid MongoDB ObjectId format

    const oldTweet = await Tweet.findById(tweetId)   // Fetch the tweet from the database to check if it exists

    // Check if the tweet exists
    if (!oldTweet) {
        throw new ApiError(404, 'Tweet not found')
    }

    // Authorization check: Verify that the logged-in user is the owner of the tweet
    // This prevents users from deleting other people's tweets
    if (!oldTweet.owner.equals(req.user._id)) {   // .equals() is used to compare MongoDB ObjectIds properly
        throw new ApiError(403, 'You are not authorized to delete this tweet')
    }

    // Delete the tweet from the database
    await oldTweet.deleteOne()   // deleteOne() is called on the document instance to remove it

    // Send success response with:
    return res
        .status(200)   // 200 status code (OK)
        .json(new ApiResponse(
            200,
            {},   // Empty object {} (common practice for delete operations - no data to return)
            'Tweet deleted successfully'   // Success message
        ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}