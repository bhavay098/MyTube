import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getLikedVideos } from "../services/like.service.js";

const LikedVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLikedVideos = async () => {
      try {
        const data = await getLikedVideos();
        if (!isMounted) return;
        const likedVideoDocs = (data || []).flatMap((item) => (item.video ? [item.video] : []));
        setVideos(likedVideoDocs);
      } catch (error) {
        if (!isMounted) return;
        toast.error(error?.response?.data?.message || "Failed to load liked videos");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLikedVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <Heart size={20} className="text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Liked Videos</h1>
            <p className="text-xs text-(--muted)">
              Videos you have liked across the platform
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="heart"
            title="No liked videos"
            description="Videos you like will appear here for easy playback"
            actionLabel="Discover Videos"
            onAction={() => navigate("/explore")}
          />
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </Layout>
  );
};

export default LikedVideos;
