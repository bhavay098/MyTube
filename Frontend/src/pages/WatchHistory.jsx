import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { History } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
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
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <History size={20} className="text-(--accent)" />
          </div>
          <h1 className="text-2xl font-bold text-(--text)">Watch History</h1>
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="history"
            title="No watch history"
            description="Videos you watch will show up here"
          />
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </Layout>
  );
};

export default WatchHistory;
