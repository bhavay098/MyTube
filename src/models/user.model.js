import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

// Define the User schema with fields and constraints
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,   // removes leading/trailing spaces
        index: true   // makes username searchable
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true   // useful for search features
    },
    avatar: {
        type: String,   // cloudinary URL for profile picture
        required: true
    },
    avatarPublicId: {
        type: String,   // Cloudinary public_id (needed for deletion)
        required: true
    },
    coverImage: {
        type: String,   // optional cloudinary URL for cover/banner
    },
    coverImagePublicId: {
        type: String,   // Cloudinary public_id (needed for deletion)
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Video'   // stores references to Video documents
    }],
    password: {
        type: String,   // plain password will never be stored directly, it will be hashed before saving (see pre-save hook below)
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String   // refresh token stored for re-authentication
    }
    
}, { timestamps: true })   // auto-generates createdAt and updatedAt fields   


// Middleware: Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();   // Only hash the password if it was modified or is new

    try {
        this.password = await bcrypt.hash(this.password, 10)   // Hash the password with 10 salt rounds
        next()
    } catch (error) {
        next(error)   // pass error to mongoose
    }
})

// Instance method: Check if entered password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)   // Compare entered password with hashed password in DB
}

// Instance method: Generate Access Token (short-lived)
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,   // put user details in the payload
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,   // secret key from env
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

// Instance method: Generate Refresh Token (long-lived)
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,   // only store minimal info
        },
        process.env.REFRESH_TOKEN_SECRET,   // different secret key
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

// Export the User model
export const User = mongoose.model('User', userSchema)