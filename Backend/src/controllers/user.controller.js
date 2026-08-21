import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongoId } from "../utils/validateMongoId.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";

// Helper function to generate Access and Refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, bio } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All required fields must be filled");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Could not upload avatar to cloud storage");
  }

  const user = await User.create({
    fullName: fullName.trim(),
    avatar: avatar.url,
    avatarPublicId: avatar.public_id,
    coverImage: coverImage?.url || "",
    coverImagePublicId: coverImage?.public_id || "",
    email: email.toLowerCase().trim(),
    password,
    username: username.toLowerCase().trim(),
    bio: bio ? bio.trim() : "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -avatarPublicId -coverImagePublicId",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const identifier = (email || username || "").toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -avatarPublicId -coverImagePublicId",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged in successfully",
      ),
    );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Delete the authenticated user's account and all data owned by that account.
const deleteCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+avatarPublicId +coverImagePublicId",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ownedVideos = await Video.find({ owner: user._id }).select(
    "_id videoFilePublicId thumbnailPublicId",
  );
  const ownedVideoIds = ownedVideos.map((video) => video._id);
  const ownedTweets = await Tweet.find({ owner: user._id }).select("_id");
  const ownedTweetIds = ownedTweets.map((tweet) => tweet._id);
  const ownedComments = await Comment.find({
    $or: [{ owner: user._id }, { video: { $in: ownedVideoIds } }],
  }).select("_id");
  const ownedCommentIds = ownedComments.map((comment) => comment._id);

  await Promise.all([
    deleteFromCloudinary(user.avatarPublicId),
    deleteFromCloudinary(user.coverImagePublicId),
    ...ownedVideos.flatMap((video) => [
      deleteFromCloudinary(video.videoFilePublicId, "video"),
      deleteFromCloudinary(video.thumbnailPublicId, "image"),
    ]),
  ]);

  await Promise.all([
    Like.deleteMany({
      $or: [
        { likedBy: user._id },
        { video: { $in: ownedVideoIds } },
        { tweet: { $in: ownedTweetIds } },
        { comment: { $in: ownedCommentIds } },
      ],
    }),
    Comment.deleteMany({ _id: { $in: ownedCommentIds } }),
    Tweet.deleteMany({ _id: { $in: ownedTweetIds } }),
    Playlist.deleteMany({ owner: user._id }),
    Subscription.deleteMany({
      $or: [{ subscriber: user._id }, { channel: user._id }],
    }),
    User.updateMany(
      {},
      { $pull: { watchHistory: { $in: ownedVideoIds } } },
    ),
    Playlist.updateMany(
      {},
      { $pull: { videos: { $in: ownedVideoIds } } },
    ),
    Video.deleteMany({ _id: { $in: ownedVideoIds } }),
    User.findByIdAndDelete(user._id),
  ]);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token missing");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

// Change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new password are required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get current logged-in user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// Update account details (fullName, email, bio)
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio } = req.body;

  if (!fullName && !email && bio === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updateFields = {};
  if (fullName && fullName.trim()) updateFields.fullName = fullName.trim();
  if (email && email.trim()) updateFields.email = email.toLowerCase().trim();
  if (bio !== undefined) updateFields.bio = bio.trim();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true },
  ).select("-password -refreshToken -avatarPublicId -coverImagePublicId");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Update avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const oldUser = await User.findById(req.user._id);
  if (oldUser?.avatarPublicId) {
    await deleteFromCloudinary(oldUser.avatarPublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
      },
    },
    { new: true },
  ).select("-password -refreshToken -avatarPublicId -coverImagePublicId");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Avatar image updated successfully",
      ),
    );
});

// Update cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const oldUser = await User.findById(req.user._id);
  if (oldUser?.coverImagePublicId) {
    await deleteFromCloudinary(oldUser.coverImagePublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
        coverImagePublicId: coverImage.public_id,
      },
    },
    { new: true },
  ).select("-password -refreshToken -avatarPublicId -coverImagePublicId");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// Get user channel profile with full metadata
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        bio: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      channel[0],
      "User channel fetched successfully",
    ),
  );
});

// Get logged-in user's watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              likes: 1,
              category: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      user[0]?.watchHistory || [],
      "Watch history fetched successfully",
    ),
  );
});

// Remove a single video from watch history
const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateMongoId(videoId, "Video ID");

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        watchHistory: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true },
  );

  return res.status(200).json(
    new ApiResponse(200, {}, "Video removed from watch history successfully"),
  );
});

// Clear all watch history
const clearWatchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        watchHistory: [],
      },
    },
    { new: true },
  );

  return res.status(200).json(
    new ApiResponse(200, {}, "Watch history cleared successfully"),
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  deleteCurrentUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
};
