import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public / optional auth read routes
router.route("/user/:userId").get(optionalJWT, getUserPlaylists);
router.route("/:playlistId").get(optionalJWT, getPlaylistById);

// Secured mutate routes
router.route("/").post(verifyJWT, createPlaylist);

router.route("/:playlistId")
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

export default router;