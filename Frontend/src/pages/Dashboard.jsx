import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Play,
  Eye,
  Heart,
  Users,
  Video,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import { getChannelStats, getChannelVideos } from "../services/dashboard.service.js";

const statConfig = [
  {
    key: "totalVideos",
    label: "Total Videos",
    icon: Play,
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    key: "totalViews",
    label: "Total Views",
    icon: Eye,
    gradient: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
  },
  {
    key: "totalLikes",
    label: "Total Likes",
    icon: Heart,
    gradient: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-400",
  },
  {
    key: "totalSubscribers",
    label: "Subscribers",
    icon: Users,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <h1 className="mb-6 text-2xl font-bold text-(--text)">
          Creator Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-(--border) bg-(--surface) p-5"
            >
              <SkeletonLine width="w-10" height="h-10" />
              <SkeletonLine width="w-20" height="h-8" />
              <SkeletonLine width="w-16" height="h-3" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <BarChart3 size={20} className="text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-(--text)">
              Creator Dashboard
            </h1>
            <p className="text-sm text-(--muted)">
              Overview of your channel performance
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stats?.[stat.key] ?? 0;

            return (
              <div
                key={stat.key}
                className={`relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-200 hover:border-(--border-strong) hover:shadow-(--shadow-sm)`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`}
                />
                <div className="relative">
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-2) ${stat.iconColor}`}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="text-3xl font-bold text-(--text)">
                    {value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-(--muted)">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Videos Table */}
        <section className="mt-8 rounded-2xl border border-(--border) bg-(--surface) p-5">
          <div className="mb-4 flex items-center gap-2">
            <Video size={18} className="text-(--muted)" />
            <h2 className="text-lg font-semibold text-(--text)">Your Videos</h2>
          </div>

          {videos.length === 0 ? (
            <EmptyState
              icon="video"
              title="No videos yet"
              description="Upload your first video to see it here"
              actionLabel="Upload Video"
              onAction={() => (window.location.href = "/upload")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border) text-xs font-medium uppercase tracking-wider text-(--muted)">
                    <th className="pb-3 pr-4">Video</th>
                    <th className="pb-3 pr-4">Views</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr
                      key={video._id}
                      className="border-b border-(--border) last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          to={`/video/${video._id}`}
                          className="flex items-center gap-3"
                        >
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="h-10 w-16 rounded-lg object-cover"
                            />
                          )}
                          <span className="line-clamp-1 text-sm font-medium text-(--text) hover:text-(--accent) transition-colors">
                            {video.title}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--muted)">
                        {(video.views ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            video.isPublished
                              ? "bg-(--success-soft) text-(--success)"
                              : "bg-(--warning-soft) text-(--warning)"
                          }`}
                        >
                          {video.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-(--muted-strong)">
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
