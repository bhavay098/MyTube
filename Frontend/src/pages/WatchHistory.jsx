import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { History, Trash2, X, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "timeago.js";

import Layout from "../components/layout/Layout.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory
} from "../services/user.service.js";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}:${String(remainMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const WatchHistory = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getWatchHistory();
      setVideos(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRemoveSingle = async (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setRemovingId(videoId);
      await removeFromWatchHistory(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Removed from history");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      await clearWatchHistory();
      setVideos([]);
      setClearDialogOpen(false);
      toast.success("Watch history cleared");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear history");
    } finally {
      setClearing(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
              <History size={20} className="text-(--accent)" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Watch History</h1>
              <p className="text-xs text-(--muted)">
                Manage videos you have watched
              </p>
            </div>
          </div>

          {videos.length > 0 && (
            <button
              type="button"
              onClick={() => setClearDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-4 py-2 text-xs font-medium text-(--muted) transition-colors hover:border-(--error) hover:bg-(--error-soft) hover:text-(--error) cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="history"
            title="No watch history"
            description="Videos you watch will appear here"
            actionLabel="Explore Videos"
            onAction={() => (window.location.href = "/explore")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => {
              const duration = formatDuration(video?.duration);
              const timeAgo = video?.createdAt ? format(video.createdAt) : "";

              return (
                <div
                  key={video._id}
                  className="group relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow-sm) transition-transform transition-colors duration-300 hover:-translate-y-1 hover:border-(--accent) hover:shadow-(--shadow)"
                >
                  <Link to={`/video/${video._id}`} className="block">
                    <div className="relative aspect-video overflow-hidden rounded-[1.1rem] bg-(--surface-2)">
                      <img
                        src={video?.thumbnail}
                        alt={video?.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-transform transition-opacity duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <Play size={20} className="ml-0.5 text-black" fill="black" />
                        </div>
                      </div>

                      {duration && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                          {duration}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    title="Remove from history"
                    onClick={(e) => handleRemoveSingle(video._id, e)}
                    disabled={removingId === video._id}
                    className="absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-(--error) cursor-pointer"
                  >
                    <X size={14} />
                  </button>

                  <div className="mt-4 flex gap-3">
                    <img
                      src={video?.owner?.avatar}
                      alt={video?.owner?.username}
                      className="h-10 w-10 shrink-0 rounded-full border border-(--border) object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <Link to={`/video/${video._id}`}>
                        <h3 className="line-clamp-2 text-sm sm:text-[15px] font-medium leading-snug tracking-tight text-(--text) hover:text-(--accent) transition-colors">
                          {video?.title}
                        </h3>
                      </Link>

                      <p className="mt-1 text-xs sm:text-sm font-normal text-(--muted)">
                        {video?.owner?.fullName}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-(--muted-strong)">
                        <span>{video?.views ?? 0} views</span>
                        {timeAgo && (
                          <>
                            <span>•</span>
                            <span>{timeAgo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ConfirmDialog
          open={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
          onConfirm={handleClearAll}
          title="Clear Watch History?"
          description="This will permanently delete your entire watch history. This action cannot be undone."
          confirmLabel="Clear History"
          variant="danger"
          loading={clearing}
        />
      </div>
    </Layout>
  );
};

export default WatchHistory;
