import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout.jsx";

import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

import { getAllVideos } from "../services/video.service.js";

const Home = () => {
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchVideos = async (query = "") => {
    try {
      setLoading(true);

      const data = await getAllVideos({
        page: 1,
        limit: 12,
        query,
      });

      setVideos(data?.videos || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      fetchVideos();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <Layout onSearch={fetchVideos}>
      {loading ? (
        <SkeletonGrid count={8} />
      ) : videos.length === 0 ? (
        <EmptyState
          icon="video"
          title="No videos found"
          description="Try searching for something else or upload the first video!"
          actionLabel="Upload Video"
          onAction={() => (window.location.href = "/upload")}
        />
      ) : (
        <div className="animate-fade-in">
          <VideoGrid videos={videos} />
        </div>
      )}
    </Layout>
  );
};

export default Home;
