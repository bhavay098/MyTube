import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
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
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Liked Videos</h1>
      {loading ? (
        <p className="text-(--muted)">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-(--muted)">No liked videos yet.</p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </Layout>
  );
};

export default LikedVideos;
