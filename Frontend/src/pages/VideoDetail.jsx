import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { format } from "timeago.js";
import {
  Heart,
  UserPlus,
  ListPlus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";

import { getVideoById } from "../services/video.service.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
} from "../services/comment.service.js";
import { toggleCommentLike, toggleVideoLike } from "../services/like.service.js";
import { toggleSubscription } from "../services/subscription.service.js";
import { addVideoToPlaylist, getUserPlaylists } from "../services/playlist.service.js";
import {
  deleteVideo,
  toggleVideoPublishStatus,
  updateVideo,
} from "../services/video.service.js";

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);

  const editThumbnailRef = useRef(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const videoData = await getVideoById(videoId);
      setVideo(videoData);

      if (currentUser?._id) {
        const [commentsData, userPlaylists] = await Promise.all([
          getVideoComments(videoId),
          getUserPlaylists(currentUser._id),
        ]);
        setComments(commentsData?.comments || []);
        setPlaylists(userPlaylists || []);
      } else {
        setComments([]);
        setPlaylists([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const run = async () => {
        try {
          setLoading(true);
          const videoData = await getVideoById(videoId);
          setVideo(videoData);

          if (currentUser?._id) {
            const [commentsData, userPlaylists] = await Promise.all([
              getVideoComments(videoId),
              getUserPlaylists(currentUser._id),
            ]);
            setComments(commentsData?.comments || []);
            setPlaylists(userPlaylists || []);
          } else {
            setComments([]);
            setPlaylists([]);
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to load video");
        } finally {
          setLoading(false);
        }
      };
      run();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [videoId, currentUser]);

  const handlePostComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    try {
      setPostingComment(true);
      await addComment(videoId, commentText);
      setCommentText("");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleLikeVideo = async () => {
    try {
      await toggleVideoLike(videoId);
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like video");
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscription(video?.owner?._id);
      toast.success("Subscription updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update subscription",
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await toggleCommentLike(commentId);
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like comment");
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) return;
    try {
      await addVideoToPlaylist(videoId, selectedPlaylistId);
      toast.success("Added to playlist");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add video to playlist",
      );
    }
  };

  const handleTogglePublish = async () => {
    try {
      await toggleVideoPublishStatus(videoId);
      await fetchAll();
      toast.success("Publish status updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update publish status",
      );
    }
  };

  const handleDeleteVideo = async () => {
    try {
      setDeleteLoading(true);
      await deleteVideo(videoId);
      toast.success("Video deleted");
      setDeleteDialogOpen(false);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete video");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = () => {
    setEditTitle(video?.title || "");
    setEditDescription(video?.description || "");
    setEditThumbnail(null);
    setEditModalOpen(true);
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDescription);
      if (editThumbnail) {
        formData.append("thumbnail", editThumbnail);
      }
      await updateVideo(videoId, formData);
      await fetchAll();
      toast.success("Video updated");
      setEditModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update video");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    try {
      setDeleteCommentLoading(true);
      await deleteComment(deleteCommentId);
      await fetchAll();
      setDeleteCommentId(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="skeleton-shimmer aspect-video w-full rounded-2xl" />
          <div className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5">
            <SkeletonLine width="w-3/4" height="h-6" />
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-1/2" height="h-4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-(--text)">Video not found</p>
          <p className="mt-2 text-sm text-(--muted)">
            This video may have been removed or is unavailable.
          </p>
        </div>
      </Layout>
    );
  }

  const isOwner = currentUser?._id === video?.owner?._id;

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-5xl space-y-6">
        {/* Video Player */}
        <video
          className="aspect-video w-full rounded-2xl border border-(--border) bg-black"
          controls
          src={video?.videoFile}
        />

        {/* Video Info */}
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h1 className="text-xl font-bold text-(--text)">{video?.title}</h1>

          {/* Channel + actions row */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/channel/${video?.owner?.username}`}>
                <img
                  src={video?.owner?.avatar}
                  alt={video?.owner?.username}
                  className="h-11 w-11 rounded-full border border-(--border) object-cover transition-transform hover:scale-105"
                />
              </Link>
              <div>
                <Link
                  to={`/channel/${video?.owner?.username}`}
                  className="text-sm font-semibold text-(--text) hover:text-(--accent) transition-colors"
                >
                  {video?.owner?.fullName}
                </Link>
                <p className="text-xs text-(--muted)">
                  @{video?.owner?.username}
                </p>
              </div>

              {!isOwner && (
                <button
                  onClick={handleSubscribe}
                  className="ml-2 flex items-center gap-1.5 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong)"
                >
                  <UserPlus size={14} />
                  Subscribe
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLikeVideo}
                className="flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface-2) px-4 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:border-(--accent) hover:text-(--accent)"
              >
                <Heart size={16} />
                {video?.likes || 0}
              </button>

              {playlists.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedPlaylistId}
                    onChange={(event) =>
                      setSelectedPlaylistId(event.target.value)
                    }
                    className="rounded-full border border-(--border) bg-(--surface-2) px-3 py-2 text-sm text-(--text) outline-none"
                  >
                    <option value="">Add to playlist</option>
                    {playlists.map((playlist) => (
                      <option key={playlist._id} value={playlist._id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToPlaylist}
                    disabled={!selectedPlaylistId}
                    className="flex items-center gap-1 rounded-full border border-(--border) bg-(--surface-2) px-3 py-2 text-sm text-(--text) transition-all duration-200 hover:border-(--accent) disabled:opacity-40"
                  >
                    <ListPlus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 rounded-xl bg-(--surface-2) p-4">
            <div className="flex items-center gap-2 text-sm text-(--muted)">
              <span>{video?.views ?? 0} views</span>
              {video?.createdAt && (
                <>
                  <span>•</span>
                  <span>{format(video.createdAt)}</span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-(--text) whitespace-pre-wrap">{video?.description}</p>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-(--border) pt-4">
              <button
                onClick={handleTogglePublish}
                className="flex items-center gap-1.5 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:bg-(--surface-2)"
              >
                {video?.isPublished ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}
                {video?.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={openEditModal}
                className="flex items-center gap-1.5 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:bg-(--surface-2)"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-(--error) px-4 py-2 text-sm font-medium text-(--error) transition-all duration-200 hover:bg-(--error-soft)"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Comments */}
        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="text-lg font-semibold text-(--text)">
            {comments.length} Comment{comments.length !== 1 ? "s" : ""}
          </h2>

          {currentUser?._id ? (
            <>
              <form
                onSubmit={handlePostComment}
                className="mt-4 flex items-start gap-3"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.username}
                  className="mt-1 h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="flex flex-1 gap-2">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || postingComment}
                    className="flex items-center gap-1.5 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-40"
                  >
                    {postingComment ? <Spinner size={14} /> : <Send size={14} />}
                  </button>
                </div>
              </form>

              <div className="mt-5 space-y-3">
                {comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="animate-fade-in flex gap-3 rounded-xl border border-(--border) bg-(--surface-2) p-4"
                  >
                    <img
                      src={comment?.owner?.avatar || currentUser?.avatar}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-(--text)">
                          {comment?.owner?.username || "User"}
                        </span>
                        {comment?.createdAt && (
                          <span className="text-xs text-(--muted-strong)">
                            {format(comment.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-(--text)">
                        {comment.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          className="flex items-center gap-1 text-xs text-(--muted) transition-colors hover:text-(--accent)"
                        >
                          <Heart size={13} />
                          {comment.likes || 0}
                        </button>
                        {currentUser?._id === comment?.owner?._id && (
                          <button
                            onClick={() => setDeleteCommentId(comment._id)}
                            className="flex items-center gap-1 text-xs text-(--muted) transition-colors hover:text-(--error)"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
                {comments.length === 0 && (
                  <p className="py-4 text-center text-sm text-(--muted)">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-(--muted)">
              <Link to="/login" className="text-(--accent) hover:underline">
                Sign in
              </Link>{" "}
              to view and post comments.
            </p>
          )}
        </section>
      </div>

      {/* Edit Video Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Video"
      >
        <form onSubmit={handleUpdateVideo} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--muted)">
              Title
            </label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--muted)">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--muted)">
              New Thumbnail
            </label>
            <input
              ref={editThumbnailRef}
              type="file"
              accept="image/*"
              onChange={(e) => setEditThumbnail(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-sm text-(--text) file:mr-3 file:rounded-lg file:border-0 file:bg-(--accent) file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium text-(--text) transition-colors hover:bg-(--surface-2)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-(--accent-strong) disabled:opacity-50"
            >
              {editLoading && <Spinner size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Video Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteVideo}
        title="Delete Video?"
        description="This will permanently delete this video and all its data. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Delete Comment Confirm */}
      <ConfirmDialog
        open={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment?"
        description="This comment will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteCommentLoading}
      />
    </Layout>
  );
};

export default VideoDetail;
