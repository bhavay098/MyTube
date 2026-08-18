import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { format } from "timeago.js";
import {
  Heart,
  Pencil,
  Trash2,
  Send,
  MessageSquareText,
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
  updateTweet,
} from "../services/tweet.service.js";
import { toggleTweetLike } from "../services/like.service.js";

const MAX_TWEET_LENGTH = 280;

const Tweets = () => {
  const user = useSelector((state) => state.auth.user);
  const [tweets, setTweets] = useState([]);
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

  const fetchTweets = async () => {
    if (!user?._id) return;
    try {
      const data = await getUserTweets(user._id);
      setTweets(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load tweets");
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    const timerId = window.setTimeout(() => {
      const run = async () => {
        try {
          const data = await getUserTweets(user._id);
          setTweets(data || []);
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to load tweets");
        }
      };
      run();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [user]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!tweetText.trim()) return;
    try {
      setPosting(true);
      await createTweet(tweetText);
      setTweetText("");
      await fetchTweets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post tweet");
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
      await fetchTweets();
      setEditModalOpen(false);
      toast.success("Tweet updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update tweet");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteTweet(deleteTweetId);
      await fetchTweets();
      setDeleteTweetId(null);
      toast.success("Tweet deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete tweet");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      await toggleTweetLike(tweetId);
      await fetchTweets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like tweet");
    }
  };

  const charCount = tweetText.length;
  const isOverLimit = charCount > MAX_TWEET_LENGTH;

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <MessageSquareText size={20} className="text-(--accent)" />
          </div>
          <h1 className="text-2xl font-bold text-(--text)">Tweets</h1>
        </div>

        {/* Compose */}
        <div className="mb-6 rounded-2xl border border-(--border) bg-(--surface) p-5">
          <form onSubmit={handleCreate}>
            <div className="flex gap-3">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="mt-1 h-10 w-10 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <textarea
                  value={tweetText}
                  onChange={(event) => setTweetText(event.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-all duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      isOverLimit ? "text-(--error)" : "text-(--muted-strong)"
                    }`}
                  >
                    {charCount}/{MAX_TWEET_LENGTH}
                  </span>
                  <button
                    type="submit"
                    disabled={
                      posting || !tweetText.trim() || isOverLimit
                    }
                    className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-40"
                  >
                    {posting ? (
                      <Spinner size={14} />
                    ) : (
                      <Send size={14} />
                    )}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <article
              key={tweet._id}
              className="animate-fade-in rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-200 hover:border-(--border-strong)"
            >
              <div className="flex gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-(--text)">
                      {user?.fullName}
                    </span>
                    <span className="text-xs text-(--muted-strong)">
                      @{user?.username}
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
                  <div className="mt-3 flex items-center gap-1">
                    <button
                      onClick={() => handleLike(tweet._id)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-(--muted) transition-colors hover:bg-(--accent-soft) hover:text-(--accent)"
                    >
                      <Heart size={14} />
                      {tweet.likes || 0}
                    </button>
                    <button
                      onClick={() => openEditModal(tweet)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-(--muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTweetId(tweet._id)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-(--muted) transition-colors hover:bg-(--error-soft) hover:text-(--error)"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {tweets.length === 0 && (
            <EmptyState
              icon="tweet"
              title="No tweets yet"
              description="Share your thoughts with your audience"
            />
          )}
        </div>
      </div>

      {/* Edit Tweet Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Tweet"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${
                editContent.length > MAX_TWEET_LENGTH
                  ? "text-(--error)"
                  : "text-(--muted-strong)"
              }`}
            >
              {editContent.length}/{MAX_TWEET_LENGTH}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium text-(--text) transition-colors hover:bg-(--surface-2)"
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
                className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-(--accent-strong) disabled:opacity-50"
              >
                {editLoading && <Spinner size={14} />}
                Save
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
        title="Delete Tweet?"
        description="This tweet will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default Tweets;
