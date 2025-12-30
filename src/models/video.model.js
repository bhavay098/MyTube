import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

// Define the Video schema
const videoSchema = new Schema({
    videoFile: {
        type: String,   // Cloudinary URL (actual video file)
        required: true
    },
    videoFilePublicId: {
        type: String,   // Cloudinary public_id (needed for deletion)
        required: true
    },
    thumbnail: {
        type: String,   // Cloudinary URL (thumbnail image of the video)
        required: true
    },
    thumbnailPublicId: {
        type: String,   // Cloudinary public_id (needed for deletion)
        required: true
    },
    title: {
        type: String,   // Title of the video
        required: true
    },
    description: {
        type: String,   // Description of the video
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,   // Whether video is public or not
        required: true,
        default: true   // default is published (visible)
    },
    owner: {
        type: Schema.Types.ObjectId,   // Reference to User collection
        ref: 'User',   // Each video belongs to a user
        required: true
    }

}, { timestamps: true })


// Plugins
// Adds aggregation + pagination support to the schema. Useful for paginated video lists, search results, etc.
videoSchema.plugin(mongooseAggregatePaginate)

// Export Video model
export const Video = mongoose.model('Video', videoSchema)