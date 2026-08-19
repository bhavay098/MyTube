import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { format } from "timeago.js";
import {
  Heart,
  UserPlus,
  UserCheck,
  ListPlus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Share2
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import CustomVideoPlayer from "../components/video/player/CustomVideoPlayer.jsx";

import {
  getVideoById,
  getRelatedVideos,
  deleteVideo,
  toggleVideoPublishStatus,
  updateVideo,
} from "../services/video.service.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
} from "../services/comment.service.js";
import { toggleCommentLike, toggleVideoLike } from "../services/like.service.js";
import { toggleSubscription } from "../services/subscription.service.js";
import { addVideoToPlaylist, getUserPlaylists } from "../services/playlist.service.js";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}:${String(remainMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const handleShare = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  }
};

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);

  const editThumbnailRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [videoData, relatedData] = await Promise.all([
        getVideoById(videoId),
        getRelatedVideos(videoId).catch(() => []),
      ]);

      setVideo(videoData);
      setRelatedVideos(relatedData || []);

      try {
        const commentsData = await getVideoComments(videoId);
        setComments(commentsData?.comments || commentsData || []);
      } catch {
        setComments([]);
      }

      if (currentUser?._id) {
        try {
          const userPlaylists = await getUserPlaylists(currentUser._id);
          setPlaylists(userPlaylists || []);
        } catch {
          setPlaylists([]);
        }
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [videoId, currentUser]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [videoData, relatedData] = await Promise.all([
          getVideoById(videoId),
          getRelatedVideos(videoId).catch(() => []),
        ]);

        if (!isMounted) return;
        setVideo(videoData);
        setRelatedVideos(relatedData || []);

        try {
          const commentsData = await getVideoComments(videoId);
          if (isMounted) {
            setComments(commentsData?.comments || commentsData || []);
          }
        } catch {
          if (isMounted) setComments([]);
        }

        if (currentUser?._id) {
          try {
            const userPlaylists = await getUserPlaylists(currentUser._id);
            if (isMounted) setPlaylists(userPlaylists || []);
          } catch {
            if (isMounted) setPlaylists([]);
          }
        } else {
          if (isMounted) setPlaylists([]);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error?.response?.data?.message || "Failed to load video");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [videoId, currentUser]);

  const handlePostComment = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      toast.error("Please login to post comments");
      navigate("/login", { state: { from: `/video/${videoId}` } });
      return;
    }
    if (!commentText.trim()) return;
    try {
      setPostingComment(true);
      const newComment = await addComment(videoId, commentText);
      setCommentText("");
      setComments((prev) => [newComment, ...prev]);
      toast.success("Comment posted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleLikeVideo = async () => {
    if (!currentUser) {
      toast.error("Please login to like this video");
      navigate("/login", { state: { from: `/video/${videoId}` } });
      return;
    }
    try {
      const res = await toggleVideoLike(videoId);
      const isNowLiked = res?.data?.isLiked;
      setVideo((prev) => ({
        ...prev,
        isLiked: isNowLiked,
        likes: isNowLiked ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 0) - 1),
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update like");
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error("Please login to subscribe to channels");
      navigate("/login", { state: { from: `/video/${videoId}` } });
      return;
    }
    try {
      setSubscribing(true);
      const res = await toggleSubscription(video?.owner?._id);
      const isNowSubscribed = res?.data?.isSubscribed;
      setVideo((prev) => ({
        ...prev,
        owner: {
          ...prev.owner,
          isSubscribed: isNowSubscribed,
          subscribersCount: isNowSubscribed
            ? (prev.owner?.subscribersCount || 0) + 1
            : Math.max(0, (prev.owner?.subscribersCount || 0) - 1),
        },
      }));
      toast.success(isNowSubscribed ? "Subscribed successfully" : "Unsubscribed successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update subscription",
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      toast.error("Please login to like comments");
      navigate("/login", { state: { from: `/video/${videoId}` } });
      return;
    }
    try {
      const res = await toggleCommentLike(commentId);
      const isNowLiked = res?.data?.isLiked;
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            return {
              ...c,
              isLiked: isNowLiked,
              likesCount: isNowLiked
                ? (c.likesCount || 0) + 1
                : Math.max(0, (c.likesCount || 0) - 1),
            };
          }
          return c;
        }),
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like comment");
    }
  };

  const handleAddToPlaylist = async () => {
    if (!currentUser) {
      toast.error("Please login to manage playlists");
      navigate("/login", { state: { from: `/video/${videoId}` } });
      return;
    }
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
    if (editThumbnailRef.current) {
      editThumbnailRef.current.value = "";
    }
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
      const newThumbnail = editThumbnailRef.current?.files?.[0];
      if (newThumbnail) {
        formData.append("thumbnail", newThumbnail);
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
      setComments((prev) => prev.filter((c) => c._id !== deleteCommentId));
      setDeleteCommentId(null);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="skeleton-shimmer aspect-video w-full rounded-3xl" />
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
          <Link
            to="/explore"
            className="mt-4 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong)"
          >
            Explore Videos
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwner = currentUser?._id === video?.owner?._id;
  const nextVideo = relatedVideos.length > 0 ? relatedVideos[0] : null;

  const handlePlayNext = () => {
    if (nextVideo?._id) {
      navigate(`/video/${nextVideo._id}`);
    }
  };

  const playerComponent = (
    <CustomVideoPlayer
      src={video?.videoFile}
      poster={video?.thumbnail}
      title={video?.title}
      hasNextVideo={!!nextVideo}
      onNextVideo={handlePlayNext}
      nextVideoTitle={nextVideo?.title}
      isTheaterMode={isTheaterMode}
      onToggleTheater={() => setIsTheaterMode((prev) => !prev)}
      autoPlay={true}
    />
  );

  return (
    <Layout>
      <div
        className={`animate-fade-in mx-auto ${
          isTheaterMode ? "max-w-[1550px] space-y-6" : "max-w-7xl"
        }`}
      >
        {/* Top Full-Width Player for Theater Mode */}
        {isTheaterMode && (
          <div className="w-full">
            {playerComponent}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Video & Comments Column (2 cols on lg) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Standard Inline Player for Normal View */}
            {!isTheaterMode && playerComponent}

            {/* Video Info Card */}
            <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
              <h1 className="text-xl font-semibold tracking-tight text-(--text) sm:text-2xl leading-snug">
                {video?.title}
              </h1>

              {/* Channel + actions row */}
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <Link to={`/channel/${video?.owner?.username}`}>
                    <img
                      src={video?.owner?.avatar}
                      alt={video?.owner?.username}
                      className="h-12 w-12 rounded-full border border-(--border) object-cover transition-transform hover:scale-105"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/channel/${video?.owner?.username}`}
                      className="text-base font-semibold text-(--text) hover:text-(--accent) transition-colors"
                    >
                      {video?.owner?.fullName}
                    </Link>
                    <p className="text-xs text-(--muted)">
                      {video?.owner?.subscribersCount ?? 0} subscribers
                    </p>
                  </div>

                  {!isOwner && (
                    <button
                      onClick={handleSubscribe}
                      disabled={subscribing}
                      className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        video?.owner?.isSubscribed
                          ? "border border-(--border) bg-(--surface-2) text-(--text) hover:border-(--error) hover:text-(--error)"
                          : "bg-(--accent) text-white hover:bg-(--accent-strong) shadow-md shadow-(--accent-soft)"
                      }`}
                    >
                      {subscribing ? (
                        <Spinner size={14} />
                      ) : video?.owner?.isSubscribed ? (
                        <>
                          <UserCheck size={14} />
                          <span>Subscribed</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Subscribe</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Video Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLikeVideo}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      video?.isLiked
                        ? "border-(--accent) bg-(--accent-soft) text-(--accent)"
                        : "border-(--border) bg-(--surface-2) text-(--text) hover:border-(--accent) hover:text-(--accent)"
                    }`}
                  >
                    <Heart
                      size={15}
                      className={video?.isLiked ? "fill-current" : ""}
                    />
                    <span>{video?.likes || 0}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface-2) px-4 py-2 text-xs font-medium text-(--text) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-3) cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>

                  {playlists.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Select playlist"
                        value={selectedPlaylistId}
                        onChange={(event) =>
                          setSelectedPlaylistId(event.target.value)
                        }
                        className="rounded-full border border-(--border) bg-(--surface-2) px-3 py-2 text-xs font-medium text-(--text) outline-none"
                      >
                        <option value="">Save to playlist</option>
                        {playlists.map((playlist) => (
                          <option key={playlist._id} value={playlist._id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddToPlaylist}
                        disabled={!selectedPlaylistId}
                        aria-label="Add to playlist"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-(--surface-2) text-(--text) transition-colors duration-200 hover:border-(--border-strong) disabled:opacity-40 cursor-pointer"
                      >
                        <ListPlus size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description box */}
              <div className="mt-5 rounded-2xl bg-(--surface-2) p-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-(--muted-strong)">
                  <span>{video?.views?.toLocaleString() ?? 0} views</span>
                  {video?.createdAt && (
                    <>
                      <span>•</span>
                      <span>{format(video.createdAt)}</span>
                    </>
                  )}
                  {video?.category && video.category !== "All" && (
                    <>
                      <span>•</span>
                      <span className="rounded-full bg-(--surface) px-2.5 py-0.5 text-xs font-medium text-(--accent)">
                        #{video.category}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-(--text) whitespace-pre-wrap">
                  {video?.description}
                </p>
              </div>

              {/* Owner controls */}
              {isOwner && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-(--border) pt-4">
                  <button
                    onClick={handleTogglePublish}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-4 py-2 text-xs font-medium text-(--text) transition-colors duration-200 hover:bg-(--surface-2) cursor-pointer"
                  >
                    {video?.isPublished ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                    {video?.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={openEditModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-4 py-2 text-xs font-medium text-(--text) transition-colors duration-200 hover:bg-(--surface-2) cursor-pointer"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-(--error) px-4 py-2 text-xs font-medium text-(--error) transition-colors duration-200 hover:bg-(--error-soft) cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
              <h2 className="text-lg font-semibold tracking-tight text-(--text)">
                {comments.length} Comment{comments.length !== 1 ? "s" : ""}
              </h2>

              {currentUser?._id ? (
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
                    <label htmlFor="video-comment-input" className="sr-only">
                      Add a public comment
                    </label>
                    <input
                      id="video-comment-input"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Add a public comment..."
                      className="flex-1 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || postingComment}
                      className="flex items-center gap-1.5 rounded-2xl bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-40 cursor-pointer"
                    >
                      {postingComment ? <Spinner size={14} /> : <Send size={14} />}
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                  <p className="text-sm text-(--muted)">
                    Sign in to leave a comment or join the discussion.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: `/video/${videoId}` }}
                    className="inline-flex items-center justify-center rounded-full bg-(--accent) px-5 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong)"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              <div className="mt-6 space-y-3.5">
                {comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="animate-fade-in flex gap-3.5 rounded-2xl border border-(--border) bg-(--surface-2) p-4"
                  >
                    <img
                      src={comment?.owner?.avatar || "/default-avatar.png"}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-(--text)">
                          {comment?.owner?.fullName || comment?.owner?.username || "User"}
                        </span>
                        <span className="text-xs text-(--muted)">
                          @{comment?.owner?.username}
                        </span>
                        {comment?.createdAt && (
                          <>
                            <span className="text-xs text-(--muted-strong)">•</span>
                            <span className="text-xs text-(--muted-strong)">
                              {format(comment.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-(--text) leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                            comment.isLiked
                              ? "text-(--accent)"
                              : "text-(--muted) hover:text-(--accent)"
                          }`}
                        >
                          <Heart
                            size={13}
                            className={comment.isLiked ? "fill-current" : ""}
                          />
                          <span>{comment.likesCount || comment.likes || 0}</span>
                        </button>
                        {currentUser?._id === comment?.owner?._id && (
                          <button
                            onClick={() => setDeleteCommentId(comment._id)}
                            className="flex items-center gap-1 text-xs text-(--muted) transition-colors hover:text-(--error) cursor-pointer"
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
                  <p className="py-6 text-center text-sm text-(--muted)">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Rail: Related Videos Sidebar (1 col on lg) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-(--accent)" />
              <h2 className="text-base font-semibold tracking-tight text-(--text)">Related Videos</h2>
            </div>

            <div className="space-y-3">
              {relatedVideos.map((rVideo) => {
                const duration = formatDuration(rVideo?.duration);
                const timeAgo = rVideo?.createdAt ? format(rVideo.createdAt) : "";

                return (
                  <Link
                    key={rVideo._id}
                    to={`/video/${rVideo._id}`}
                    className="group flex gap-3 rounded-2xl border border-(--border) bg-(--surface) p-2.5 transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-2)"
                  >
                    <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-(--surface-2)">
                      <img
                        src={rVideo?.thumbnail}
                        alt={rVideo?.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {duration && (
                        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                          {duration}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="line-clamp-2 text-xs sm:text-sm font-medium leading-snug text-(--text) group-hover:text-(--text) transition-colors">
                        {rVideo?.title}
                      </h3>
                      <p className="mt-1 text-xs text-(--muted) truncate">
                        {rVideo?.owner?.fullName || rVideo?.owner?.username}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-(--muted-strong)">
                        <span>{rVideo?.views ?? 0} views</span>
                        {timeAgo && (
                          <>
                            <span>•</span>
                            <span>{timeAgo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {relatedVideos.length === 0 && (
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 text-center text-xs text-(--muted)">
                  No related videos available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Video Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Video"
      >
        <form onSubmit={handleUpdateVideo} className="space-y-4">
          <div>
            <label
              htmlFor="edit-video-title"
              className="mb-1.5 block text-sm font-medium text-(--muted)"
            >
              Title
            </label>
            <input
              id="edit-video-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div>
            <label
              htmlFor="edit-video-desc"
              className="mb-1.5 block text-sm font-medium text-(--muted)"
            >
              Description
            </label>
            <textarea
              id="edit-video-desc"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div>
            <label
              htmlFor="edit-video-thumb"
              className="mb-1.5 block text-sm font-medium text-(--muted)"
            >
              New Thumbnail (optional)
            </label>
            <input
              id="edit-video-thumb"
              ref={editThumbnailRef}
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-sm text-(--text) file:mr-3 file:rounded-lg file:border-0 file:bg-(--accent) file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium text-(--text) transition-colors hover:bg-(--surface-2) cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong) disabled:opacity-50 cursor-pointer"
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
        description="This will permanently delete this video and all its comments and likes. This action cannot be undone."
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
