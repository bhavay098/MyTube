import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../services/tweet.service.js";
import { toggleTweetLike } from "../services/like.service.js";

const Tweets = () => {
  const user = useSelector((state) => state.auth.user);
  const [tweets, setTweets] = useState([]);
  const [tweetText, setTweetText] = useState("");

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
      await createTweet(tweetText);
      setTweetText("");
      await fetchTweets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post tweet");
    }
  };

  const handleEdit = async (tweet) => {
    const editedContent = window.prompt("Edit tweet", tweet.content);
    if (!editedContent) return;
    try {
      await updateTweet(tweet._id, editedContent);
      await fetchTweets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update tweet");
    }
  };

  const handleDelete = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      await fetchTweets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete tweet");
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

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Tweets</h1>
      <form onSubmit={handleCreate} className="mb-5 flex gap-3">
        <input
          value={tweetText}
          onChange={(event) => setTweetText(event.target.value)}
          placeholder="Share something"
          className="flex-1 rounded-xl border border-(--border) bg-(--surface) px-4 py-2 text-(--text)"
        />
        <button className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white">
          Post
        </button>
      </form>
      <div className="space-y-3">
        {tweets.map((tweet) => (
          <article
            key={tweet._id}
            className="rounded-xl border border-(--border) bg-(--surface) p-4"
          >
            <p className="text-(--text)">{tweet.content}</p>
            <div className="mt-3 flex gap-3 text-xs text-(--muted)">
              <button onClick={() => handleLike(tweet._id)}>
                Like ({tweet.likes || 0})
              </button>
              <button onClick={() => handleEdit(tweet)}>Edit</button>
              <button onClick={() => handleDelete(tweet._id)}>Delete</button>
            </div>
          </article>
        ))}
        {tweets.length === 0 && <p className="text-(--muted)">No tweets yet.</p>}
      </div>
    </Layout>
  );
};

export default Tweets;
