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
        required: true,
        trim: true
    },
    description: {
        type: String,   // Description of the video
        required: true,
        trim: true
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
    category: {
        type: String,
        default: 'All',
        trim: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,   // Whether video is public or not
        required: true,
        default: true   // default is published (visible)
    },
    owner: {
        type: Schema.Types.ObjectId,   // Reference to User collection
        ref: 'User',   // Each video belongs to a user
        required: true,
        index: true
    }

}, { timestamps: true })

// Search and performance indexes
videoSchema.index({ title: 'text', description: 'text', tags: 'text' })
videoSchema.index({ category: 1, isPublished: 1, createdAt: -1 })
videoSchema.index({ views: -1, isPublished: 1 })
videoSchema.index({ owner: 1, isPublished: 1, createdAt: -1 })

// Plugins
// Adds aggregation + pagination support to the schema.
videoSchema.plugin(mongooseAggregatePaginate)

// Export Video model
export const Video = mongoose.model('Video', videoSchema)