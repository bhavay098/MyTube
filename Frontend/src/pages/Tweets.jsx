import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { Globe, Heart, MessageSquareText, Pencil, Send, Trash2, UserCheck } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { createTweet, deleteTweet, getAllTweetsFeed, getUserTweets, updateTweet } from "../services/tweet.service.js";
import { toggleTweetLike } from "../services/like.service.js";

const MAX_TWEET_LENGTH = 280;

const TweetComposer = ({ user, text, posting, onChange, onSubmit }) => {
  if (!user) return <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 text-center"><p className="text-xs text-(--muted)"><Link to="/login" className="font-semibold text-(--accent) hover:underline">Sign in</Link>{" "}to create community posts and interact with creators.</p></div>;
  const isOverLimit = text.length > MAX_TWEET_LENGTH;
  return <div className="rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-sm)"><form onSubmit={onSubmit}><div className="flex gap-3.5"><img src={user.avatar} alt={user.username} className="mt-1 h-10 w-10 shrink-0 rounded-full border border-(--border) object-cover" /><div className="flex-1"><label htmlFor="compose-tweet-input" className="sr-only">Share something with the community</label><textarea id="compose-tweet-input" value={text} onChange={(event) => onChange(event.target.value)} placeholder="Share something with the community..." rows={3} className="w-full resize-none rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" /><div className="mt-2.5 flex items-center justify-between"><span className={`text-xs ${isOverLimit ? "text-(--error)" : "text-(--muted)"}`}>{text.length}/{MAX_TWEET_LENGTH}</span><button type="submit" disabled={posting || !text.trim() || isOverLimit} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--accent) px-5 py-2 text-xs font-semibold text-white shadow-md shadow-(--accent-soft) transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-40">{posting ? <Spinner size={14} /> : <Send size={13} />}<span>Post</span></button></div></div></div></form></div>;
};

const TweetCard = ({ tweet, currentUser, onLike, onEdit, onDelete }) => {
  const author = tweet?.owner || currentUser;
  const isAuthor = currentUser?._id === author?._id;
  return <article className="animate-fade-in rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-sm) transition-colors duration-200 hover:border-(--border-strong)"><div className="flex gap-3.5"><Link to={`/channel/${author?.username}`}><img src={author?.avatar || "/default-avatar.png"} alt={author?.username} className="h-10 w-10 shrink-0 rounded-full border border-(--border) object-cover transition-transform hover:scale-105" /></Link><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Link to={`/channel/${author?.username}`} className="text-sm font-semibold text-(--text) transition-colors hover:text-(--accent)">{author?.fullName || author?.username}</Link><span className="text-xs text-(--muted)">@{author?.username}</span>{tweet?.createdAt && <><span className="text-xs text-(--muted-strong)">•</span><span className="text-xs text-(--muted-strong)">{format(tweet.createdAt)}</span></>}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--text)">{tweet.content}</p><div className="mt-3.5 flex items-center gap-2"><button type="button" onClick={() => onLike(tweet._id)} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${tweet.isLiked ? "bg-(--accent-soft) text-(--accent)" : "text-(--muted) hover:bg-(--accent-soft) hover:text-(--accent)"}`}><Heart size={14} className={tweet.isLiked ? "fill-current" : ""} /><span>{tweet.likesCount || tweet.likes || 0}</span></button>{isAuthor && <><button type="button" onClick={() => onEdit(tweet)} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"><Pencil size={13} />Edit</button><button type="button" onClick={() => onDelete(tweet._id)} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--muted) transition-colors hover:bg-(--error-soft) hover:text-(--error)"><Trash2 size={13} />Delete</button></>}</div></div></div></article>;
};

const TweetFeed = ({ tweets, loading, user, activeTab, onLike, onEdit, onDelete }) => <div className="space-y-4">{loading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="skeleton-shimmer h-32 rounded-3xl" />)}</div> : tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} currentUser={user} onLike={onLike} onEdit={onEdit} onDelete={onDelete} />)}{!loading && tweets.length === 0 && <EmptyState icon="tweet" title="No posts found" description={activeTab === "my_posts" ? "You haven't created any posts yet." : "Be the first to share a post with the community!"} />}</div>;

const TweetModals = ({ editOpen, editContent, editLoading, deleteId, deleteLoading, onEditChange, onEditClose, onEditSubmit, onDeleteClose, onDelete }) => <><Modal open={editOpen} onClose={onEditClose} title="Edit Community Post"><form onSubmit={onEditSubmit} className="space-y-4"><label htmlFor="edit-tweet-input" className="sr-only">Edit post content</label><textarea id="edit-tweet-input" value={editContent} onChange={(event) => onEditChange(event.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" /><div className="flex items-center justify-between"><span className={`text-xs ${editContent.length > MAX_TWEET_LENGTH ? "text-(--error)" : "text-(--muted)"}`}>{editContent.length}/{MAX_TWEET_LENGTH}</span><div className="flex gap-3"><button type="button" onClick={onEditClose} className="rounded-xl border border-(--border) px-5 py-2 text-xs font-medium text-(--text) transition-colors hover:bg-(--surface-2)">Cancel</button><button type="submit" disabled={editLoading || !editContent.trim() || editContent.length > MAX_TWEET_LENGTH} className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-(--accent-strong) disabled:opacity-50">{editLoading && <Spinner size={14} />}Save Changes</button></div></div></form></Modal><ConfirmDialog open={!!deleteId} onClose={onDeleteClose} onConfirm={onDelete} title="Delete Post?" description="This community post will be permanently removed." confirmLabel="Delete" variant="danger" loading={deleteLoading} /></>;

const Tweets = () => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("feed");
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tweetText, setTweetText] = useState("");
  const [posting, setPosting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const editTweetRef = useRef(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTweetId, setDeleteTweetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTweets = useCallback(async (tab = activeTab) => {
    try { setLoading(true); const data = tab === "my_posts" && user?._id ? await getUserTweets(user._id) : await getAllTweetsFeed(); setTweets(data || []); }
    catch (error) { toast.error(error?.response?.data?.message || "Failed to load posts"); }
    finally { setLoading(false); }
  }, [activeTab, user]);
  useEffect(() => {
    let mounted = true;
    const loadTweets = async () => {
      try {
        setLoading(true);
        const data = activeTab === "my_posts" && user?._id
          ? await getUserTweets(user._id)
          : await getAllTweetsFeed();
        if (mounted) setTweets(data || []);
      } catch (error) {
        if (mounted) toast.error(error?.response?.data?.message || "Failed to load posts");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadTweets();
    return () => { mounted = false; };
  }, [activeTab, user]);

  const handleCreate = async (event) => {
    event.preventDefault(); if (!user) return toast.error("Please login to create a community post"); if (!tweetText.trim()) return;
    try { setPosting(true); await createTweet(tweetText); setTweetText(""); await fetchTweets(activeTab); toast.success("Post published to community"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to post"); } finally { setPosting(false); }
  };
  const openEditModal = (tweet) => { editTweetRef.current = tweet; setEditContent(tweet.content); setEditModalOpen(true); };
  const handleEdit = async (event) => {
    event.preventDefault(); if (!editContent.trim() || !editTweetRef.current) return;
    try { setEditLoading(true); await updateTweet(editTweetRef.current._id, editContent); await fetchTweets(activeTab); setEditModalOpen(false); toast.success("Post updated"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to update post"); } finally { setEditLoading(false); }
  };
  const handleDelete = async () => {
    try { setDeleteLoading(true); await deleteTweet(deleteTweetId); setTweets((previous) => previous.filter((tweet) => tweet._id !== deleteTweetId)); setDeleteTweetId(null); toast.success("Post deleted"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to delete post"); } finally { setDeleteLoading(false); }
  };
  const handleLike = async (tweetId) => {
    if (!user) return toast.error("Please login to like posts");
    try { const response = await toggleTweetLike(tweetId); const liked = response?.data?.isLiked; setTweets((previous) => previous.map((tweet) => tweet._id === tweetId ? { ...tweet, isLiked: liked, likesCount: liked ? (tweet.likesCount || tweet.likes || 0) + 1 : Math.max(0, (tweet.likesCount || tweet.likes || 0) - 1) } : tweet)); } catch (error) { toast.error(error?.response?.data?.message || "Failed to like post"); }
  };

  return <Layout><div className="animate-fade-in mx-auto max-w-2xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)"><MessageSquareText size={20} className="text-(--accent)" /></div><div><h1 className="text-2xl font-semibold tracking-tight text-(--text)">Community</h1><p className="text-xs text-(--muted)">Explore thoughts and updates from creators</p></div></div><div className="flex rounded-xl border border-(--border) bg-(--surface) p-1"><button type="button" onClick={() => setActiveTab("feed")} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${activeTab === "feed" ? "bg-(--accent) text-white" : "text-(--muted) hover:text-(--text)"}`}><Globe size={13} />All Posts</button>{user && <button type="button" onClick={() => setActiveTab("my_posts")} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${activeTab === "my_posts" ? "bg-(--accent) text-white" : "text-(--muted) hover:text-(--text)"}`}><UserCheck size={13} />My Posts</button>}</div></div><TweetComposer user={user} text={tweetText} posting={posting} onChange={setTweetText} onSubmit={handleCreate} /><TweetFeed tweets={tweets} loading={loading} user={user} activeTab={activeTab} onLike={handleLike} onEdit={openEditModal} onDelete={setDeleteTweetId} /></div><TweetModals editOpen={editModalOpen} editContent={editContent} editLoading={editLoading} deleteId={deleteTweetId} deleteLoading={deleteLoading} onEditChange={setEditContent} onEditClose={() => setEditModalOpen(false)} onEditSubmit={handleEdit} onDeleteClose={() => setDeleteTweetId(null)} onDelete={handleDelete} /></Layout>;
};

export default Tweets;
