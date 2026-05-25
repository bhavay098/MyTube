import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import { getChannelStats, getChannelVideos } from "../services/dashboard.service.js";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, videosData] = await Promise.all([
          getChannelStats(),
          getChannelVideos(),
        ]);
        setStats(statsData);
        setVideos(videosData?.videos || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard");
      }
    };
    fetchDashboard();
  }, []);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Creator Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-(--border) bg-(--surface) p-4 text-(--text)">
          Videos: {stats?.totalVideos ?? 0}
        </div>
        <div className="rounded-xl border border-(--border) bg-(--surface) p-4 text-(--text)">
          Views: {stats?.totalViews ?? 0}
        </div>
        <div className="rounded-xl border border-(--border) bg-(--surface) p-4 text-(--text)">
          Likes: {stats?.totalLikes ?? 0}
        </div>
        <div className="rounded-xl border border-(--border) bg-(--surface) p-4 text-(--text)">
          Subscribers: {stats?.totalSubscribers ?? 0}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <h2 className="mb-4 text-lg font-semibold text-(--text)">Your Videos</h2>
        <div className="space-y-2">
          {videos.map((video) => (
            <div key={video._id} className="text-sm text-(--text)">
              {video.title}
            </div>
          ))}
          {videos.length === 0 && (
            <p className="text-(--muted)">No videos found for your channel.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
