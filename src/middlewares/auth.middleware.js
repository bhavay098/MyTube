import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

// Middleware to verify JWT access token and attach user to request object. This protects routes that require authentication.
export const verifyJWT = asyncHandler(async (req, _, next) => {
    // STEP 1: EXTRACT TOKEN FROM REQUEST - Get token from either cookies or Authorization header
    // Cookies: req.cookies?.accessToken
    // Header: req.header('Authorization') with format "Bearer <token>". We need to remove "Bearer " prefix to get just the token
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')   

    // STEP 2: CHECK IF TOKEN EXISTS - If no token found in either location, user is not authenticated
    if (!token) {
        throw new ApiError(401, 'Unauthorised request')   // 401 = Unauthorized (authentication required but not provided)
    }

    // Verify token using JWT library and ACCESS_TOKEN_SECRET - If the token is invalid or expired, jwt.verify will throw an error
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Find user in DB using ID from decoded token. Exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id).select('-password -refreshToken -avatarPublicId -coverImagePublicId')

    // If user does not exist (e.g., deleted), throw 401 error
    if (!user) {
        throw new ApiError(401, 'Invalid Access Token')
    }

    req.user = user;   // Attach the user to req object so that downstream route handlers can access it
    next()   // Call next() to pass control to the next middleware or route handler
})