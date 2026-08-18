import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getLikedVideos } from "../services/like.service.js";

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const data = await getLikedVideos();
        const likedVideoDocs = (data || [])
          .map((item) => item.video)
          .filter(Boolean)
          .map((video) => ({
            ...video,
            owner: video.owner || {},
          }));
        setVideos(likedVideoDocs);
      } catch (error) {
        if (error?.response?.status !== 404) {
          toast.error(error?.response?.data?.message || "Failed to load likes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <Heart size={20} className="text-(--accent)" />
          </div>
          <h1 className="text-2xl font-bold text-(--text)">Liked Videos</h1>
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="heart"
            title="No liked videos"
            description="Videos you like will appear here"
          />
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </Layout>
  );
};

export default LikedVideos;
