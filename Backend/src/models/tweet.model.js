import mongoose, { Schema } from 'mongoose'

// Define the schema structure for tweets in the database
// Similar to Twitter/X posts - short text messages posted by users
const tweetSchema = new Schema({
    content: {   // The actual text content of the tweet
        type: String,   // Data type is string
        required: true   // This field is mandatory - cannot create an empty tweet
    },
    likes: {
        type: Number,
        default: 0,
    },
    owner: {   // Reference to the user who posted this tweet
        type: Schema.Types.ObjectId,   // Store the ID of the user who created the tweet
        ref: 'User',   // References the User model/collection
        required: true   // Every tweet must have an owner (cannot be anonymous)
    }

}, { timestamps: true })   // Automatically adds createdAt and updatedAt fields

// Create and export the Tweet model using the schema
export const Tweet = mongoose.model('Tweet', tweetSchema)