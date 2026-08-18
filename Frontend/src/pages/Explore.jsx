import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getAllVideos } from "../services/video.service.js";
import { Compass, Sparkles, TrendingUp, Flame } from "lucide-react";

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { label: "All", icon: Compass },
    { label: "Trending", icon: Flame },
    { label: "Latest", icon: Sparkles },
    { label: "Popular", icon: TrendingUp },
  ];

  const fetchVideos = async (query = "") => {
    try {
      setLoading(true);
      const data = await getAllVideos({
        page: 1,
        limit: 24,
        query,
      });
      setVideos(data?.videos || []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchVideos(query);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      fetchVideos(searchQuery);
    } else if (category === "Trending" || category === "Popular") {
      fetchVideos(searchQuery);
    } else {
      fetchVideos(searchQuery);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <Layout onSearch={handleSearch}>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-(--border) bg-gradient-to-r from-(--surface) via-(--surface-2) to-(--surface) p-6 sm:p-8 shadow-(--shadow-sm)">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-semibold text-(--accent)">
              <Compass size={14} />
              <span>Discover & Explore</span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-(--text) sm:text-3xl">
              Explore All Videos
            </h1>
            <p className="mt-2 text-sm text-(--muted) sm:text-base">
              Browse top creators, trending uploads, and discover your next favorite video on MyTube.
            </p>
          </div>

          {/* Category Chips */}
          <div className="relative z-10 mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleCategoryChange(cat.label)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-(--accent) text-white shadow-md shadow-(--accent-soft)"
                      : "border border-(--border) bg-(--surface) text-(--muted) hover:border-(--accent) hover:text-(--text)"
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Decorative background glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-(--accent-soft) blur-3xl opacity-60" />
        </div>

        {/* Video Grid or Empty State */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="video"
            title={searchQuery ? `No videos matching "${searchQuery}"` : "No videos found"}
            description="Try searching for another keyword or be the first to upload a video!"
            actionLabel="Upload Video"
            onAction={() => (window.location.href = "/upload")}
          />
        ) : (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-strong)">
                Showing {videos.length} videos
              </p>
            </div>
            <VideoGrid videos={videos} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
