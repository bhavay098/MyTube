import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import Layout from "../components/layout/Layout.jsx";
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
  const currentUser = useSelector((state) => state.auth.user);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

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
      await addComment(videoId, commentText);
      setCommentText("");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
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
    const proceed = window.confirm("Delete this video?");
    if (!proceed) return;
    try {
      await deleteVideo(videoId);
      toast.success("Video deleted");
      window.location.href = "/";
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete video");
    }
  };

  const handleUpdateVideo = async () => {
    const title = window.prompt("New title", video?.title || "");
    const description = window.prompt("New description", video?.description || "");
    if (!title || !description) return;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("thumbnail", file);
        await updateVideo(videoId, formData);
        await fetchAll();
        toast.success("Video updated");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to update video");
      }
    };
    fileInput.click();
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-(--muted)">Loading video...</div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-(--muted)">Video not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <video
          className="aspect-video w-full rounded-2xl border border-(--border) bg-black"
          controls
          src={video?.videoFile}
        />

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h1 className="text-xl font-semibold text-(--text)">{video?.title}</h1>
          <p className="mt-2 text-sm text-(--muted)">{video?.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleLikeVideo}
              className="rounded-full border border-(--border) px-4 py-2 text-sm text-(--text)"
            >
              Like ({video?.likes || 0})
            </button>
            <button
              onClick={handleSubscribe}
              className="rounded-full bg-(--accent) px-4 py-2 text-sm font-medium text-white"
            >
              Subscribe
            </button>
            <Link
              to={`/channel/${video?.owner?.username}`}
              className="text-sm text-(--accent)"
            >
              @{video?.owner?.username}
            </Link>
            {playlists.length > 0 && (
              <>
                <select
                  value={selectedPlaylistId}
                  onChange={(event) => setSelectedPlaylistId(event.target.value)}
                  className="rounded-full border border-(--border) bg-(--surface-2) px-3 py-2 text-sm text-(--text)"
                >
                  <option value="">Select playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist._id} value={playlist._id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToPlaylist}
                  className="rounded-full border border-(--border) px-3 py-2 text-sm text-(--text)"
                >
                  Add to Playlist
                </button>
              </>
            )}
            {currentUser?._id === video?.owner?._id && (
              <>
                <button
                  onClick={handleTogglePublish}
                  className="rounded-full border border-(--border) px-4 py-2 text-sm text-(--text)"
                >
                  {video?.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={handleUpdateVideo}
                  className="rounded-full border border-(--border) px-4 py-2 text-sm text-(--text)"
                >
                  Update
                </button>
                <button
                  onClick={handleDeleteVideo}
                  className="rounded-full border border-red-400 px-4 py-2 text-sm text-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="text-lg font-semibold text-(--text)">Comments</h2>

          {currentUser?._id ? (
            <>
              <form onSubmit={handlePostComment} className="mt-4 flex gap-3">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment"
                  className="flex-1 rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white"
                >
                  Post
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="rounded-xl border border-(--border) bg-(--surface-2) p-4"
                  >
                    <p className="text-sm text-(--text)">{comment.content}</p>
                    <div className="mt-3 flex gap-3 text-xs text-(--muted)">
                      <button onClick={() => handleLikeComment(comment._id)}>
                        Like ({comment.likes || 0})
                      </button>
                      {currentUser?._id === comment?.owner?._id && (
                        <button onClick={() => handleDeleteComment(comment._id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-(--muted)">No comments yet.</p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-(--muted)">
              Sign in to view and post comments.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default VideoDetail;
