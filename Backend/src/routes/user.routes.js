import { Router } from "express";
import {
    loginUser,
    logoutUser,
    deleteCurrentUser,
    registerUser,
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
} from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// -------------- PUBLIC ROUTES ------------------------------
router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);

// Get user channel profile by username (optionalJWT allows guest or auth subscriber check)
router.route('/channel/:username').get(optionalJWT, getUserChannelProfile);

// ------------- SECURED ROUTES -----------------
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/account').delete(verifyJWT, deleteCurrentUser);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

// Watch History routes
router.route('/watch-history')
    .get(verifyJWT, getWatchHistory)
    .delete(verifyJWT, clearWatchHistory);

router.route('/watch-history/:videoId').delete(verifyJWT, removeFromWatchHistory);

export default router;
