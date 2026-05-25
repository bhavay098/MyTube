import mongoose, { Schema } from 'mongoose'

// Define the schema structure for playlists in the database
// Similar to YouTube playlists or Spotify playlists - a collection of videos
const playlistSchema = new Schema({
    name: {   // The name/title of the playlist
        type: String,    // Data type is string
        required: true   // This field is mandatory - every playlist must have a name
    },
    description: {   // Description explaining what the playlist is about
        type: String,    // Data type is string
        required: true   // This field is mandatory - every playlist must have a description
    },
    videos: [{   // Array of video IDs that belong to this playlist. The square brackets [] indicate this is an array field
        type: Schema.Types.ObjectId,   // Each element is a video's ObjectId
        ref: 'Video'   // References the Video model/collection
        // Not required, since a playlist can be created empty and videos can be added later
    }],
    owner: {   // Reference to the user who created/owns this playlist
        type: Schema.Types.ObjectId,   // Store the ID of the user who created the playlist
        ref: 'User',   // References the User model/collection
        required: true   // Every playlist must have an owner
    }

}, { timestamps: true })

// Create and export the Playlist model using the schema
export const Playlist = mongoose.model('Playlist', playlistSchema)