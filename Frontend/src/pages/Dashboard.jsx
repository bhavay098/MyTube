import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Play,
  Eye,
  Heart,
  Users,
  Video,
  BarChart3,
  MessageSquare,
  EyeOff,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import { getChannelStats, getChannelVideos } from "../services/dashboard.service.js";
import { toggleVideoPublishStatus } from "../services/video.service.js";

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
  {
    key: "totalComments",
    label: "Total Comments",
    icon: MessageSquare,
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, videosData] = await Promise.all([
        getChannelStats(),
        getChannelVideos({ limit: 50 }),
      ]);
      setStats(statsData);
      setVideos(videosData?.videos || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTogglePublish = async (videoId) => {
    try {
      setTogglingId(videoId);
      await toggleVideoPublishStatus(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
        )
      );
      toast.success("Publish status updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-(--text)">
          Creator Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-(--border) bg-(--surface) p-5"
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
      <div className="animate-fade-in space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
              <BarChart3 size={20} className="text-(--accent)" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
                Creator Studio Dashboard
              </h1>
              <p className="text-xs text-(--muted)">
                Real-time metrics and channel management
              </p>
            </div>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-2xl bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-strong) shadow-md shadow-(--accent-soft)"
          >
            <Play size={14} />
            <span>Upload New Video</span>
          </Link>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stats?.[stat.key] ?? 0;

            return (
              <div
                key={stat.key}
                className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-5 transition-colors duration-200 hover:border-(--border-strong) hover:shadow-(--shadow-sm)"
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
                  <p className="text-2xl font-bold tracking-tight text-(--text) tabular-nums">
                    {value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-medium text-(--muted)">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Videos Management Table */}
        <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Video size={18} className="text-(--accent)" />
              <h2 className="text-lg font-semibold tracking-tight text-(--text)">Uploaded Content ({videos.length})</h2>
            </div>
          </div>

          {videos.length === 0 ? (
            <EmptyState
              icon="video"
              title="No videos uploaded yet"
              description="Start creating content to see analytics and manage your video library"
              actionLabel="Upload Video"
              onAction={() => (window.location.href = "/upload")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border) text-xs font-medium uppercase tracking-wider text-(--muted)">
                    <th className="pb-3 pr-4">Video</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Views</th>
                    <th className="pb-3 pr-4">Likes</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {videos.map((video) => (
                    <tr
                      key={video._id}
                      className="group transition-colors hover:bg-(--surface-2)/50"
                    >
                      <td className="py-3.5 pr-4">
                        <Link
                          to={`/video/${video._id}`}
                          className="flex items-center gap-3"
                        >
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="h-10 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-10 w-16 rounded-xl bg-(--surface-2)" />
                          )}
                          <span className="line-clamp-1 max-w-xs text-sm font-medium text-(--text) group-hover:text-(--accent) transition-colors">
                            {video.title}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-medium text-(--muted)">
                        <span className="rounded-full bg-(--surface-2) px-2.5 py-1 text-xs">
                          {video.category || "All"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-sm font-medium text-(--text)">
                        {(video.views ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-4 text-sm font-medium text-(--text)">
                        {(video.likes ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(video._id)}
                          disabled={togglingId === video._id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            video.isPublished
                              ? "bg-(--success-soft) text-(--success) hover:bg-(--warning-soft) hover:text-(--warning)"
                              : "bg-(--warning-soft) text-(--warning) hover:bg-(--success-soft) hover:text-(--success)"
                          }`}
                        >
                          {video.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{video.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-(--muted)">
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/video/${video._id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--muted) hover:bg-(--surface-2) hover:text-(--accent)"
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </Link>
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
