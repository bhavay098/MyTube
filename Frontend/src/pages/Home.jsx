import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout.jsx";

import VideoGrid from "../components/video/VideoGrid.jsx";

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
        <div className="flex items-center justify-center py-20">
          <div className="text-(--muted)">Loading videos...</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-(--muted)">No videos found</div>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </Layout>
  );
};

export default Home;
