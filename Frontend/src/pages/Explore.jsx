import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getAllVideos, getTrendingVideos } from "../services/video.service.js";
import {
  Compass,
  Flame,
  Music,
  Gamepad2,
  Cpu,
  GraduationCap,
  Clapperboard,
  Newspaper,
  Trophy,
  Camera,
  Filter,
  Clock
} from "lucide-react";

const categories = [
  { label: "All", icon: Compass },
  { label: "Trending", icon: Flame },
  { label: "Music", icon: Music },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Tech", icon: Cpu },
  { label: "Education", icon: GraduationCap },
  { label: "Entertainment", icon: Clapperboard },
  { label: "News", icon: Newspaper },
  { label: "Sports", icon: Trophy },
  { label: "Vlogs", icon: Camera },
];

const durations = [
  { label: "All Durations", value: "" },
  { label: "Short (< 4 min)", value: "short" },
  { label: "Medium (4-20 min)", value: "medium" },
  { label: "Long (> 20 min)", value: "long" },
];

const sortOptions = [
  { label: "Latest", sortBy: "createdAt", sortType: "desc" },
  { label: "Most Viewed", sortBy: "views", sortType: "desc" },
  { label: "Most Liked", sortBy: "likes", sortType: "desc" },
];

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  const fetchVideos = async (category = activeCategory, query = searchQuery, duration = selectedDuration, sort = selectedSort) => {
    try {
      setLoading(true);

      if (category === "Trending" && !query && !duration) {
        const data = await getTrendingVideos();
        setVideos(data || []);
        return;
      }

      const params = {
        page: 1,
        limit: 24,
        query,
        sortBy: category === "Trending" ? "views" : sort.sortBy,
        sortType: sort.sortType,
      };

      if (category !== "All" && category !== "Trending") {
        params.category = category;
      }

      if (duration) {
        params.duration = duration;
      }

      const data = await getAllVideos(params);
      setVideos(data?.videos || []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchVideos(activeCategory, query, selectedDuration, selectedSort);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    fetchVideos(category, searchQuery, selectedDuration, selectedSort);
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    fetchVideos(activeCategory, searchQuery, duration, selectedSort);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    fetchVideos(activeCategory, searchQuery, selectedDuration, sort);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const data = await getAllVideos({
          page: 1,
          limit: 24,
          sortBy: sortOptions[0].sortBy,
          sortType: sortOptions[0].sortType,
        });
        if (isMounted) {
          setVideos(data?.videos || []);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout onSearch={handleSearch}>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-(--border) bg-gradient-to-r from-(--surface) via-(--surface-2) to-(--surface) p-6 sm:p-8 shadow-(--shadow-sm)">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium text-(--accent)">
              <Compass size={14} />
              <span>Discover & Explore</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-(--text)">
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
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-(--accent) text-white shadow-md shadow-(--accent-soft)"
                      : "border border-(--border) bg-(--surface) text-(--muted) hover:border-(--border-strong) hover:text-(--text)"
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Decorative background glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-(--accent-soft) blur-3xl opacity-20" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-[13px] sm:text-base">
          {/* Duration Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto sm:gap-2">
            <Clock size={15} className="text-(--muted)" />
            {durations.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => handleDurationChange(d.value)}
                className={`rounded-lg px-2 py-1 text-[11px] font-normal transition-colors cursor-pointer sm:px-2.5 sm:text-xs sm:font-medium ${
                  selectedDuration === d.value
                    ? "bg-(--accent-soft) text-(--accent)"
                    : "text-(--muted) hover:text-(--text)"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Filter size={14} className="text-(--muted)" />
            <span className="text-[11px] text-(--muted) sm:text-xs">Sort by:</span>
            <div className="flex items-center gap-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSortChange(opt)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-normal transition-colors cursor-pointer sm:px-2.5 sm:text-xs sm:font-medium ${
                    selectedSort.label === opt.label
                      ? "bg-(--surface-2) text-(--text) font-medium sm:font-semibold"
                      : "text-(--muted) hover:text-(--text)"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Grid or Empty State */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon="video"
            title={searchQuery ? `No videos matching "${searchQuery}"` : "No videos found"}
            description="Try searching for another keyword or be the first to upload a video in this category!"
            actionLabel="Upload Video"
            onAction={() => (window.location.href = "/upload")}
          />
        ) : (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-(--muted-strong)">
                Showing {videos.length} videos {activeCategory !== "All" && `in ${activeCategory}`}
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
