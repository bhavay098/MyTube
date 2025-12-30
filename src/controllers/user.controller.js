import { asyncHandler } from '../utils/asyncHandler.js';   // Utility to wrap async functions and forward errors to Express
import { ApiError } from '../utils/ApiError.js';   // Custom error class for consistent error handling
import { User } from '../models/user.model.js'   // Mongoose User model
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'   // Helpers to upload & delete files from Cloudinary
import { ApiResponse } from '../utils/ApiResponse.js';   // Custom response formatter
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

// Function to generate both Access and Refresh Tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)   // Find the user by ID

        // Generate JWT tokens using instance methods defined in User model
        const accessToken = user.generateAccessToken()   // Short-lived token for API access
        const refreshToken = user.generateRefreshToken()   // Long-lived token for getting new access tokens

        user.refreshToken = refreshToken   // Save the new refresh token in the database so we can invalidate it during logout
        await user.save({ validateBeforeSave: false })   // Save user without running validation since we're only updating the refresh token field

        return { accessToken, refreshToken }   // Return both tokens to be used in login response

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access token')   // Handle any errors while generating tokens
    }
}

// Controller: Handles user registration
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // creat user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    // Step 1: Extract user details from request body
    const { fullName, email, username, password } = req.body
    // console.log('email:', email);
    // console.log('reqBody:', req.body);

    // Step 2: Validate fields (make sure none are empty/blank)
    if ([fullName, email, username, password].some((field) => field?.trim() === '')) {   // Use array.some() to check if any field is empty or contains only whitespace
        throw new ApiError(400, 'All fields are required')   // Stop execution and send error
    }

    // Step 3: Check if user already exists (by username or email)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]   // $or is MongoDB operator that checks multiple conditions. Short for { username: username }, { email: email }
    })
    // console.log('existedUser', existedUser)

    // If user already exists, throw a 409 (Conflict) error
    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists')
    }

    // Step 4: Get file paths for avatar & cover image (from multer)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;   // req.files contains uploaded files, organized by field name. [0] gets the first file from the array (we expect only one avatar)
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // console.log('req.files:', req.files)

    // Avatar is required, so check if it was uploaded
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }

    // Step 5: Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)   // This returns an object with details about the uploaded file
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // Double-check that avatar upload was successful
    if (!avatar) {
        throw new ApiError(400, 'Could not upload avatar due to some error')
    }

    // Step 6: Create new user entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,   // Save Cloudinary avatar URL
        avatarPublicId: avatar.public_id,   // Save Cloudinary avatar public id for deletion
        coverImage: coverImage?.url || "",   // URL of cover image, or empty string if not provided
        coverImagePublicId: coverImage?.public_id || "",   // public id of cover image, or empty string if not provided
        email,
        password,   // Password will be hashed (likely handled in User model pre-save hook)
        username: username.toLowerCase()   // Convert username to lowercase for consistency
    })

    // Step 7: Fetch created user again (exclude sensitive fields)
    const createdUser = await User.findById(user._id).select(   // select() with minus sign (-) excludes those fields from the result
        "-password -refreshToken -avatarPublicId -coverImagePublicId"   // Exclude password & refreshToken
    )

    // STEP 8: VERIFY USER CREATION WAS SUCCESSFUL. If for some reason the user wasn't created properly, throw error
    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering the user')
    }

    // Step 9: Send success response
    // Send back a standardized API response with:
    // - HTTP status 201 (Created)
    // - Status code 200 in response body (for frontend consistency)
    // - The created user data (without sensitive fields)
    // - Success message
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

// Controller for logging in a user
const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    // STEP 1: EXTRACT LOGIN DATA FROM REQUEST BODY. Frontend sends this data when user submits login form
    const { email, username, password } = req.body

    // STEP 2: VALIDATION - CHECK IF USERNAME OR EMAIL PROVIDED. At least one is required
    if (!username && !email) {
        throw new ApiError(400, 'username or email is required')
    }

    // STEP 3: FIND USER IN DATABASE by username OR email
    const user = await User.findOne({
        $or: [{ username }, { email }]   // $or allows MongoDB to match either condition
    })

    // STEP 4: If user does not exist, throw error
    if (!user) {
        throw new ApiError(404, 'User does not exist')
    }

    // STEP 5: Use custom method from User model to compare provided password with stored hash
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials')   // 401 = Unauthorized (wrong credentials)
    }

    // STEP 6: Generate access and refresh tokens for the user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // STEP 7: Fetch user data to return in response, excluding password and refreshToken
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    // STEP 8: Security settings for storing tokens in browser cookies
    const options = {
        httpOnly: true,   // Cookie can't be accessed by JavaScript (prevents XSS attacks)
        secure: true   // Cookie only sent over HTTPS (set to false for localhost development)
    }

    // STEP 9: Send tokens as cookies and user info in JSON response
    return res
        .status(200)   // HTTP 200 = Success
        .cookie('accessToken', accessToken, options)   // Set access token cookie
        .cookie('refreshToken', refreshToken, options)   // Set refresh token cookie
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,   // User data without sensitive fields
                accessToken,   // Include tokens in response body (for mobile apps)
                refreshToken
            },
            'User logged in successfully'
        ))
})

// Controller for logging out a user
const logoutUser = asyncHandler(async (req, res) => {
    // STEP 1: Find user by ID and remove their refresh token from DB. req.user._id comes from auth middleware that runs before this controller
    // Note: By removing refresh token from DB, even if someone has the cookie, they can't use it to generate new access tokens
    await User.findByIdAndUpdate(
        req.user._id,   // Find user by their ID
        { $unset: { refreshToken: 1 } },   // MongoDB operator to remove/delete the refreshToken field. value '1' means "remove this field"
        { new: true }   // Return updated document
    )

    // STEP 2: CONFIGURE COOKIE OPTIONS. Cookie options to match login cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    // STEP 3: SEND SUCCESS RESPONSE AND CLEAR COOKIES
    return res
        .status(200)   // HTTP 200 = Success
        .clearCookie('accessToken', options)   // Remove access token cookie from browser
        .clearCookie('refreshToken', options)   // Remove refresh token cookie from browser
        .json(new ApiResponse(
            200,
            {},   // Empty data object (no data needed for logout)
            'User logged out'   // Success message
        ))
})

// Controller to refresh the access token using a valid refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken   // 1. Try to read refreshToken from cookies (browser) or request body (mobile apps / APIs)

    if (!incomingRefreshToken) {   // 2. If no refresh token is provided, reject the request
        throw new ApiError(401, 'unauthorized request')
    }

    // 3. Verify the refresh token using the REFRESH_TOKEN_SECRET. This ensures it was signed by our server and not tampered with.
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)   // Decodes the payload data (user ID, etc.)

    // 4. Find the user from the decoded refresh token's payload (_id). We need to verify user still exists and get their stored refresh token
    const user = await User.findById(decodedToken?._id)

    if (!user) {   // 5. If user doesn't exist in DB, reject the request as user might have been deleted after refresh token was issued
        throw new ApiError(401, 'Invalid refresh token')
    }

    // 6. Extra security check: Compare the incoming refresh token with the one stored in DB | Prevents reuse of old/expired refresh tokens
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, 'Refresh token is expired or used')
    }

    // 7. Generate new access & refresh tokens. We generate BOTH tokens (not just access token) for security
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const options = {   // 8. Cookie options: secure, httpOnly → makes them safer against XSS/CSRF
        httpOnly: true,
        secure: true
    }

    // 9. Send new tokens as cookies + JSON response | Update browser cookies AND send tokens in response body
    return res
        .status(200)   // HTTP 200 = Success
        .cookie('accessToken', accessToken, options)   // Update access token cookie
        .cookie('refreshToken', refreshToken, options)   // Update refresh token cookie
        .json(new ApiResponse(200,
            { accessToken, refreshToken },   // Include tokens in response (for mobile apps)
            'Access token refreshed')   // Success message
        )
})

// Controller to handle changing user's current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body   // Extract old and new passwords from the request body (data sent by the client)

    // Fetch the full user document from DB as (req.user does not have password). req.user?._id comes from authentication middleware (user must be logged in)
    const user = await User.findById(req.user?._id)

    if (!user) {   // Check if user exists in database (maybe account was deleted)
        throw new ApiError(404, 'User not found')
    }

    // Compare the provided old password with the hashed password in DB. isPasswordCorrect is a custom method defined in the User model that compares passwords
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {   // If the old password is wrong, throw an error
        throw new ApiError(400, 'Invalid old password')
    }

    user.password = newPassword   // Update the user's password with the new one

    // Save the updated user to DB. 'validateBeforeSave: false' skips running validation checks on unchanged fields
    await user.save({ validateBeforeSave: false })   // this will trigger hashing in pre-save hook if defined in schema

    // Send a success response back to client
    return res
        .status(200)   // HTTP status code 200 means "OK"
        .json(new ApiResponse(200, {}, 'Password changed successfully'))   // Send JSON response with success message
})

// Controller to get the currently authenticated user's details
const getCurrentUser = asyncHandler(async (req, res) => {
    // Return the user data that was attached to the request object by authentication middleware
    // 'req.user' is set by the authentication middleware (`verifyJWT`)
    // It contains the user data fetched from the database, excluding sensitive fields like password and refreshToken
    return res
        .status(200)   // HTTP status code 200 = OK
        .json(new ApiResponse(200, req.user, 'User fetched successfully'))   // Send user data as JSON response
})

// Controller to update the authenticated user's account details (full name and email)
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body   // Extract fullName and email from the request body

    if (!fullName || !email) {   // Basic validation: make sure both fields are provided
        throw new ApiError(400, 'All fields are required')
    }

    // Update the user document in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,   // Find user by their ID (from authentication middleware)
        { $set: { fullName, email } },   // MongoDB update operator - sets new values for these fields
        { new: true }   // Return the updated document instead of the old one
    ).select('-password -refreshToken -avatarPublicId -coverImagePublicId')   // Exclude sensitive fields from the returned data

    // Send success response with updated user data (without sensitive information)
    return res
        .status(200)   // HTTP 200 = OK
        .json(new ApiResponse(200, user, 'Account details updated successfully'))   // Updated user data (safe to return)
})

// Controller to update the authenticated user's avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    // Get the local path of the uploaded avatar file from the request
    const avatarLocalPath = req.file?.path   // 'req.file' is populated by Multer when using 'upload.single('avatar')'

    if (!avatarLocalPath) {    // Check if a file was uploaded
        throw new ApiError(400, 'Avatar file is missing')   // 400 = Bad Request
    }

    // Upload the avatar file to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)   // 'uploadOnCloudinary' is a helper function that handles the upload and returns file metadata

    if (!avatar.url) {   // Check if the upload was successful
        throw new ApiError(400, 'Error while uploading avatar')
    }

    // delete old avatar
    const oldUser = await User.findById(req.user._id)   // Get old user to fetch existing avatarPublicId
    await deleteFromCloudinary(oldUser.avatarPublicId)   // Delete old avatar

    // Update user with new avatar and avatarPublicId
    const user = await User.findByIdAndUpdate(
        req.user?._id,   // Find user by their ID (from authentication middleware)
        {
            $set: {
                avatar: avatar.url,   // Update avatar field with the cloud storage URL
                avatarPublicId: avatar.public_id   // Update public_id field with the cloud storage public id
            }
        },
        { new: true }   // Return the updated document instead of the old one
    ).select('-password -refreshToken -avatarPublicId -coverImagePublicId')   // Exclude sensitive fields before sending response

    // Send success response with the updated user data
    return res
        .status(200)   // HTTP 200 = OK
        .json(new ApiResponse(
            200,   // API response status code
            user,   // Updated user object (safe to return)
            'Avatar image updated successfully'))   // Message describing the response
})

// Controller to update the authenticated user's cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // Get the local path of the uploaded cover image from the request
    const coverImageLocalPath = req.file?.path   // 'req.file' is populated by Multer middleware when using 'upload.single('coverImage')'

    if (!coverImageLocalPath) {   // Check if a file was uploaded
        throw new ApiError(400, 'Cover image file is missing')   // 400 = Bad Request
    }

    // Upload the cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)   // 'uploadOnCloudinary' is a helper function that handles uploading and returns file metadata

    if (!coverImage.url) {   // Check if the upload returned a valid URL
        throw new ApiError(400, 'Error while uploading coverImage')
    }

    // delete old cover image if exists
    const oldUser = await User.findById(req.user._id)   // Get old user to fetch existing avatarPublicId
    if (oldUser.coverImagePublicId) {
        await deleteFromCloudinary(oldUser.coverImagePublicId)   // delete old cover image if exists
    }

    // Update the user's cover image URL in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,   // ID of the authenticated user (from middleware)
        {
            $set: {
                coverImage: coverImage.url,   // Update coverImage field with the cloud storage URL
                coverImagePublicId: coverImage.public_id   // Update public_id field with the cloud storage public id
            }
        },
        { new: true }   // Return the updated document instead of the old one
    ).select('-password -refreshToken -avatarPublicId -coverImagePublicId')   // Exclude sensitive fields before sending response

    // Send a success response with the updated user data
    return res
        .status(200)   // HTTP 200 = OK
        .json(new ApiResponse(200, user, 'Cover image updated successfully'))
})

// Function to get a user's channel profile with subscriber information
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params   // Extract username from URL parameters (e.g., /profile/john_doe)

    if (!username?.trim()) {   // If username is missing or just empty spaces, throw error
        throw new ApiError(400, 'username is missing')
    }

    // Use MongoDB aggregation pipeline to get complex channel data in one query. Aggregation allows us to join data from multiple collections and perform calculations
    // Each {} is a stage.
    const channel = await User.aggregate([   // channel stores the result of the aggregation query which returns an array
        {
            // Stage 1: Find the user (channel owner) by username (case-insensitive)
            // When fetching someone else’s channel/profile via URL -> match by username (since that’s what the client passes in the request).
            $match: { username: username?.toLowerCase() }
        },
        {
            // Stage 2: Get all subscribers of this channel. Join with 'subscriptions' collection where this user is the 'channel'
            $lookup: {
                from: 'subscriptions',   // Collection to join with. name of the document will be written exactly as it'll be stored in DB (lowercase & plural)
                localField: '_id',   // Field from User collection (this user's ID)
                foreignField: 'channel',   // Field from subscriptions collection (channel being subscribed to)
                as: 'subscribers'   // Name for the resulting array of subscriber documents
            }
        },
        {
            // Stage 3: Get all channels this user has subscribed to. Join with 'subscriptions' collection where this user is the 'subscriber'
            $lookup: {
                from: 'subscriptions',   // Collection to join with
                localField: '_id',   // Field from User collection (this user's ID)
                foreignField: 'subscriber',   // Field from subscriptions collection (user doing the subscribing)
                as: 'subscribedTo'   // Name for the resulting array of subscribed channel documents
            }
        },
        {
            // Stage 4: Add calculated fields based on the joined data
            $addFields: {
                subscribersCount: { $size: '$subscribers' },   // Count total subscribers by getting size of subscribers array
                channelsSubscribedToCount: { $size: '$subscribedTo' },   // Count how many channels this user subscribes to
                isSubscribed: {   // Check if the current logged-in user is subscribed to this channel
                    $cond: {   // If current user's ID exists in the subscribers list, return true
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },   // subscribers is an array of documents. MongoDB allows dot notation on arrays of documents.
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // Stage 5: Select only the fields we want to return (like SQL SELECT). This excludes sensitive data like password, refreshToken, etc.
            $project: {   // Note: 1 means include, 0 means exclude
                fullName: 1,   // Include fullName
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    // Check if the channel/user was found. aggregate() returns an array, so we check if it's empty
    if (!channel?.length) {
        throw new ApiError(404, 'channel does not exist')
    }
    // console.log(channel)  // TODO: Debugging: can log the final aggregation result

    // Send the channel data back to the client. 
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channel[0],   // channel[0] because aggregate returns an array, we want the first (and only) result (The channel profile data)
            'User channel fetched successfully'
        ))
})

// Function to get the logged-in user's watch history with video and owner details
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([   // Use MongoDB aggregation pipeline to fetch watch history with nested data
        {
            // Stage 1: Find the current logged-in user by their ID. Convert string ID to MongoDB ObjectId (req.user._id to ObjectId) format (required for aggregation)
            // req.user._id is set by authentication middleware
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }   // When fetching the logged-in user -> match by _id (best practice).
        },
        {
            // Stage 2: Get detailed information about all videos in user's watch history
            $lookup: {
                from: 'videos',   // Collection to join with (videos collection)
                localField: 'watchHistory',   // Field in User collection (array of video ObjectIds)
                foreignField: '_id',   // Match with _id field in Videos
                as: 'watchHistory',   // Output field: creates an array of video documents
                pipeline: [   // Sub-pipeline for each matched video
                    {
                        // Sub-stage 1: Lookup (join) the video's owner details from Users collection
                        $lookup: {
                            from: 'users',   // Join with users collection
                            localField: 'owner',   // Field in Video collection (ObjectId of owner)
                            foreignField: '_id',   // Match with _id field in Users
                            as: 'owner',   // Output field (will be an array)
                            pipeline: [   // Sub-pipeline: Control what owner data to include
                                {
                                    // Only include these fields from the owner's profile
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        // Sub-stage 2: Convert owner from array to single object. $lookup returns an array, but each video has only one owner
                        $addFields: {
                            owner: { $first: '$owner' }   // $first extracts the first (and only) element from the array
                        }
                    }
                ]
            }
        }
    ])

    // Send the watch history data (array of video objects with owner details) back to the client
    // user[0] because aggregate returns an array of users
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user[0].watchHistory,   // user[0] gets the first result (current user). .watchHistory accesses the populated watch history array
            'Watch history fetched successfully'
        ))
})


// Export controller functions to be used in routes
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}