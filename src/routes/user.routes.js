import { Router } from "express";   // Import Router from express to create route handlers
import {   // Import all user-related controller functions that handle the business logic
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'   // Import multer middleware for handling file uploads (images, videos, etc.)
import { verifyJWT } from "../middlewares/auth.middleware.js";   // Import JWT verification middleware to protect routes (authentication)

// Create a new router instance to define routes
const router = Router()


// -------------- PUBLIC ROUTES (No authentication required) ------------------------------


// Register - Register a new user with avatar and cover image
router.route('/register').post(
    // Multer middleware to handle multiple file uploads
    upload.fields([
        {
            name: 'avatar',   // Field name in the form for profile picture
            maxCount: 1   // Only allow one avatar file
        },
        {
            name: 'coverImage',   // Field name in the form for cover/banner image
            maxCount: 1   // Only allow one cover image file
        }
    ]),
    registerUser  // Controller function that processes registration
)

// Login existing user
router.route('/login').post(loginUser)


// ------------- SECURED ROUTES (Authentication required) -----------------
// All routes below require verifyJWT middleware (except /refresh-token)


// Logout current user. verifyJWT ensures only logged-in users can logout
router.route('/logout').post(verifyJWT, logoutUser)

// Get new access token using refresh token. This allows users to stay logged in without re-entering credentials
router.route('/refresh-token').post(refreshAccessToken)

// Change user's password. verifyJWT ensures user is logged in before changing password
router.route('/change-password').post(verifyJWT, changeCurrentPassword)

// Get current logged-in user's information. verifyJWT identifies which user is making the request
router.route('/current-user').get(verifyJWT, getCurrentUser)

// Update account details (name, email, etc.). PATCH is used instead of PUT because we're updating partial data, not replacing entire document
router.route('/update-account').patch(verifyJWT, updateAccountDetails)

// Update user's profile picture | upload.single('avatar') handles single file upload with field name 'avatar'
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

// Update user's cover/banner image | upload.single('coverImage') handles single file upload with field name 'coverImage'
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

// Get a user’s channel profile by username | :username is a URL parameter (e.g., /channel/johndoe)
// verifyJWT is used to check if current user is subscribed to this channel
router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)

// Get user's video watch history. verifyJWT ensures user can only see their own watch history
router.route('/watch-history').get(verifyJWT, getWatchHistory)


// Export the router to be used in the main app file
export default router