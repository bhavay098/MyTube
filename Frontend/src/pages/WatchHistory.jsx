import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getWatchHistory } from "../services/user.service.js";

const WatchHistory = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getWatchHistory();
        setVideos(data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Watch History</h1>
      {loading ? (
        <p className="text-(--muted)">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-(--muted)">No history found.</p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </Layout>
  );
};

export default WatchHistory;
