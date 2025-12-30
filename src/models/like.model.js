import mongoose, { Schema } from 'mongoose'

// Define the schema structure for likes in the database
// This is a flexible "polymorphic" design that allows likes on multiple content types
const likeSchema = new Schema({
    video: {   // Reference to a video that was liked (if the like is on a video)
        type: Schema.Types.ObjectId,   // Store the ID of the liked video
        ref: 'Video'   // References the Video model/collection
        // required: true -> Not required - will be null if user liked a comment or tweet instead
    },
    comment: {   // Reference to a comment that was liked (if the like is on a comment)
        type: Schema.Types.ObjectId,   // Store the ID of the liked comment
        ref: 'Comment'   // References the Comment model/collection
    },
    tweet: {   // Reference to a tweet that was liked (if the like is on a tweet)
        type: Schema.Types.ObjectId,   // Store the ID of the liked tweet
        ref: 'Tweet'   // References the Tweet model/collection
    },
    likedBy: {   // Reference to the user who performed the like action
        type: Schema.Types.ObjectId,   // Store the ID of the user who liked
        ref: 'User',   // References the User model/collection
        required: true   // Every like must have a user - cannot be anonymous
    },

}, { timestamps: true })

// Create and export the Like model using the schema
export const Like = mongoose.model('Like', likeSchema)