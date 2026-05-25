import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'   // Import pagination plugin to add pagination functionality to aggregation queries

// Define the schema structure for comments in the database. This represents user comments on videos (like YouTube comments)
const commentSchema = new Schema({
    content: {   // The actual text content of the comment
        type: String,   // Data type is string
        required: true   // This field is mandatory - cannot create a comment without content
    },
    video: {   // Reference to the video this comment belongs to
        type: Schema.Types.ObjectId,   // Store the ID of the video being commented on
        ref: 'Video'   // References the Video model/collection
        // required: true - Not required, because we might allow comments on Tweets too, etc.
    },
    likes: {
        type: Number,
        default: 0,
    },
    owner: {   // Reference to the user who wrote this comment
        type: Schema.Types.ObjectId,   // Store the ID of the user who made the comment
        ref: 'User',   // References the User model/collection
        required: true   // Every comment must have an owner (cannot be anonymous)
    },

}, { timestamps: true })   // Automatically adds createdAt and updatedAt fields

// Add pagination plugin to the schema. This allows us to paginate comments (e.g., show 20 comments per page)
// Works with MongoDB aggregation queries to efficiently handle large comment sections
commentSchema.plugin(mongooseAggregatePaginate)

// Create and export the Comment model using the schema
export const Comment = mongoose.model('Comment', commentSchema)