import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import {
  Heart,
  Pencil,
  Trash2,
  Send,
  MessageSquareText,
  Globe,
  UserCheck
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  getAllTweetsFeed,
  updateTweet,
} from "../services/tweet.service.js";
import { toggleTweetLike } from "../services/like.service.js";

const MAX_TWEET_LENGTH = 280;

const Tweets = () => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("feed"); // "feed" | "my_posts"
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tweetText, setTweetText] = useState("");
  const [posting, setPosting] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTweet, setEditTweet] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteTweetId, setDeleteTweetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTweets = async (tab = activeTab) => {
    try {
      setLoading(true);
      if (tab === "my_posts" && user?._id) {
        const data = await getUserTweets(user._id);
        setTweets(data || []);
      } else {
        const data = await getAllTweetsFeed();
        setTweets(data || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets(activeTab);
  }, [activeTab, user?._id]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please login to create a community post");
      return;
    }
    if (!tweetText.trim()) return;
    try {
      setPosting(true);
      await createTweet(tweetText);
      setTweetText("");
      await fetchTweets(activeTab);
      toast.success("Post published to community");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const openEditModal = (tweet) => {
    setEditTweet(tweet);
    setEditContent(tweet.content);
    setEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || !editTweet) return;
    try {
      setEditLoading(true);
      await updateTweet(editTweet._id, editContent);
      await fetchTweets(activeTab);
      setEditModalOpen(false);
      toast.success("Post updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteTweet(deleteTweetId);
      setTweets((prev) => prev.filter((t) => t._id !== deleteTweetId));
      setDeleteTweetId(null);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLike = async (tweetId) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const res = await toggleTweetLike(tweetId);
      const isNowLiked = res?.data?.isLiked;
      setTweets((prev) =>
        prev.map((t) => {
          if (t._id === tweetId) {
            return {
              ...t,
              isLiked: isNowLiked,
              likesCount: isNowLiked
                ? (t.likesCount || t.likes || 0) + 1
                : Math.max(0, (t.likesCount || t.likes || 0) - 1),
            };
          }
          return t;
        }),
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like post");
    }
  };

  const charCount = tweetText.length;
  const isOverLimit = charCount > MAX_TWEET_LENGTH;

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
              <MessageSquareText size={20} className="text-(--accent)" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Community</h1>
              <p className="text-xs text-(--muted)">
                Explore thoughts and updates from creators
              </p>
            </div>
          </div>

          {/* Feed Tabs */}
          <div className="flex rounded-xl border border-(--border) bg-(--surface) p-1">
            <button
              type="button"
              onClick={() => handleTabSwitch("feed")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "feed"
                  ? "bg-(--accent) text-white"
                  : "text-(--muted) hover:text-(--text)"
              }`}
            >
              <Globe size={13} />
              <span>All Posts</span>
            </button>
            {user && (
              <button
                type="button"
                onClick={() => handleTabSwitch("my_posts")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "my_posts"
                    ? "bg-(--accent) text-white"
                    : "text-(--muted) hover:text-(--text)"
                }`}
              >
                <UserCheck size={13} />
                <span>My Posts</span>
              </button>
            )}
          </div>
        </div>

        {/* Compose Card */}
        {user ? (
          <div className="rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-sm)">
            <form onSubmit={handleCreate}>
              <div className="flex gap-3.5">
                <img
                  src={user?.avatar}
                  alt={user.username}
                  className="mt-1 h-10 w-10 shrink-0 rounded-full object-cover border border-(--border)"
                />
                <div className="flex-1">
                  <textarea
                    value={tweetText}
                    onChange={(event) => setTweetText(event.target.value)}
                    placeholder="Share something with the community..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-all duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        isOverLimit ? "text-(--error)" : "text-(--muted)"
                      }`}
                    >
                      {charCount}/{MAX_TWEET_LENGTH}
                    </span>
                    <button
                      type="submit"
                      disabled={
                        posting || !tweetText.trim() || isOverLimit
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-40 cursor-pointer shadow-md shadow-(--accent-soft)"
                    >
                      {posting ? (
                        <Spinner size={14} />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 text-center">
            <p className="text-xs text-(--muted)">
              <Link to="/login" className="font-semibold text-(--accent) hover:underline">
                Sign in
              </Link>{" "}
              to create community posts and interact with creators.
            </p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton-shimmer h-32 rounded-3xl"
                />
              ))}
            </div>
          ) : tweets.map((tweet) => {
            const author = tweet?.owner || user;
            const isAuthor = user?._id === author?._id;

            return (
              <article
                key={tweet._id}
                className="animate-fade-in rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-sm) transition-all duration-200 hover:border-(--border-strong)"
              >
                <div className="flex gap-3.5">
                  <Link to={`/channel/${author?.username}`}>
                    <img
                      src={author?.avatar || "/default-avatar.png"}
                      alt={author?.username}
                      className="h-10 w-10 shrink-0 rounded-full border border-(--border) object-cover transition-transform hover:scale-105"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/channel/${author?.username}`}
                        className="text-sm font-semibold text-(--text) hover:text-(--accent) transition-colors"
                      >
                        {author?.fullName || author?.username}
                      </Link>
                      <span className="text-xs text-(--muted)">
                        @{author?.username}
                      </span>
                      {tweet?.createdAt && (
                        <>
                          <span className="text-xs text-(--muted-strong)">•</span>
                          <span className="text-xs text-(--muted-strong)">
                            {format(tweet.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-(--text) whitespace-pre-wrap">
                      {tweet.content}
                    </p>
                    <div className="mt-3.5 flex items-center gap-2">
                      <button
                        onClick={() => handleLike(tweet._id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          tweet.isLiked
                            ? "bg-(--accent-soft) text-(--accent)"
                            : "text-(--muted) hover:bg-(--accent-soft) hover:text-(--accent)"
                        }`}
                      >
                        <Heart
                          size={14}
                          className={tweet.isLiked ? "fill-current" : ""}
                        />
                        <span>{tweet.likesCount || tweet.likes || 0}</span>
                      </button>

                      {isAuthor && (
                        <>
                          <button
                            onClick={() => openEditModal(tweet)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--muted) transition-colors hover:bg-(--surface-2) hover:text-(--text) cursor-pointer"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTweetId(tweet._id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--muted) transition-colors hover:bg-(--error-soft) hover:text-(--error) cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && tweets.length === 0 && (
            <EmptyState
              icon="tweet"
              title="No posts found"
              description={
                activeTab === "my_posts"
                  ? "You haven't created any posts yet."
                  : "Be the first to share a post with the community!"
              }
            />
          )}
        </div>
      </div>

      {/* Edit Tweet Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Community Post"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${
                editContent.length > MAX_TWEET_LENGTH
                  ? "text-(--error)"
                  : "text-(--muted)"
              }`}
            >
              {editContent.length}/{MAX_TWEET_LENGTH}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl border border-(--border) px-5 py-2 text-xs font-medium text-(--text) transition-colors hover:bg-(--surface-2) cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  editLoading ||
                  !editContent.trim() ||
                  editContent.length > MAX_TWEET_LENGTH
                }
                className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-(--accent-strong) disabled:opacity-50 cursor-pointer"
              >
                {editLoading && <Spinner size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Tweet Confirm */}
      <ConfirmDialog
        open={!!deleteTweetId}
        onClose={() => setDeleteTweetId(null)}
        onConfirm={handleDelete}
        title="Delete Post?"
        description="This community post will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default Tweets;
