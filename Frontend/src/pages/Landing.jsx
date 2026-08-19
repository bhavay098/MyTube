import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MessageSquareText,
  BarChart3,
  Video,
  Layers,
  ShieldCheck,
  Zap,
  Moon,
  Sun,
  Users,
  Compass,
  CheckCircle2,
  Tv,
  Radio,
  Volume2,
  Maximize2,
} from "lucide-react";
import { toggleTheme } from "../store/themeSlice.js";
import { getAllVideos } from "../services/video.service.js";
import { checkHealth } from "../services/healthcheck.service.js";
import VideoCard from "../components/video/VideoCard.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "18:42";
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

const FEATURES = [
  {
    icon: Video,
    title: "Seamless Video Streaming",
    description:
      "High-performance video delivery with smooth playback, customizable thumbnails, and smart watch history tracking.",
    badge: "Fast Streaming",
    color: "from-rose-500/10 to-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Creator Analytics",
    description:
      "Comprehensive dashboard tracking your channel views, subscriber trajectories, likes, and engagement metrics at a glance.",
    badge: "Creator Studio",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: MessageSquareText,
    title: "Community Tweets & Microblogging",
    description:
      "Engage with your followers through instant short-form tweets, discussions, and updates directly integrated into the platform.",
    badge: "Interactive Feed",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Layers,
    title: "Playlists & Channel Customization",
    description:
      "Curate personalized video collections, design custom profile avatars and banners, and showcase your best creations.",
    badge: "Customization",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Zap,
    title: "Instant Search & Zero Bloat",
    description:
      "Lightning-fast search with zero lag, instant filtering, and a lightweight, privacy-focused viewing experience.",
    badge: "Speed",
    color: "from-amber-500/20 to-yellow-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication & Control",
    description:
      "Enterprise-grade JWT session management, full video management (publish/unpublish), and complete profile controls.",
    badge: "Security",
    color: "from-indigo-500/20 to-violet-500/20",
  },
];

const STATS = [
  { value: "Instant", label: "Video Playback" },
  { value: "0 ms", label: "Buffer Lag" },
  { value: "100%", label: "Free & Open for Creators" },
  { value: "24/7", label: "Community Engagement" },
];

const STEPS = [
  {
    num: "01",
    title: "Create Your Channel",
    desc: "Set up your profile, customize your avatar and channel banner in less than 30 seconds.",
  },
  {
    num: "02",
    title: "Upload & Share Content",
    desc: "Upload high-definition videos with custom titles, descriptions, and eye-catching thumbnails.",
  },
  {
    num: "03",
    title: "Grow & Interact",
    desc: "Post community tweets, track real-time analytics in your studio, and build a loyal audience.",
  },
];

const Landing = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    // Send non-blocking background ping to wake up Render server
    checkHealth();

    const fetchTrending = async () => {
      try {
        setLoadingVideos(true);
        const data = await getAllVideos({
          page: 1,
          limit: 4,
          sortBy: "views",
          sortType: "desc",
        });
        setTrendingVideos(data?.videos || []);
      } catch {
        setTrendingVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchTrending();
  }, []);

  const featuredVideo = trendingVideos.length > 0 ? trendingVideos[0] : null;

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) selection:bg-(--accent) selection:text-white">
      {/* ─── Top Landing Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-(--border) bg-(--bg)/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-0.5 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            <span className="text-(--accent)">My</span>
            <span className="text-(--text)">Tube</span>
          </Link>

          {/* Navigation links for desktop */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-(--muted) transition-colors hover:text-(--text)"
            >
              Features
            </a>
            <a
              href="#trending"
              className="text-sm font-medium text-(--muted) transition-colors hover:text-(--text)"
            >
              Trending
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-(--muted) transition-colors hover:text-(--text)"
            >
              How It Works
            </a>
            <Link
              to="/explore"
              className="text-sm font-medium text-(--muted) transition-colors hover:text-(--accent)"
            >
              Explore Feed
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition-colors duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-2)"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full border border-(--border) px-4 py-2 text-sm font-medium text-(--text) transition-colors duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-2) sm:inline-flex"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-(--accent-soft) transition-colors duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-(--accent-soft) transition-colors duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
              >
                <span>Go to Feed</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] max-w-full rounded-full bg-gradient-to-tr from-(--accent-soft) via-(--accent-soft) to-transparent blur-[120px] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--surface)/80 px-4 py-1.5 text-xs font-medium text-(--muted) backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="animate-pulse text-(--accent)" />
            <span className="tracking-wide uppercase">The Next-Gen Creator & Video Hub</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Where Content Meets <br />
            <span className="bg-gradient-to-r from-(--accent) to-rose-400 bg-clip-text text-transparent">
              Community & Growth
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-(--muted) sm:text-lg lg:text-xl leading-relaxed">
            Experience seamless video streaming, engage directly through community tweets, manage playlists, and unlock deep real-time analytics in your custom Creator Studio.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/home" : "/register"}
              className="inline-flex items-center gap-2.5 rounded-full bg-(--accent) px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/20 transition-colors duration-300 hover:-translate-y-1 hover:bg-(--accent-strong)"
            >
              <span>{isAuthenticated ? "Go to Video Feed" : "Create Free Account"}</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to={isAuthenticated ? "/home" : "/explore"}
              className="inline-flex items-center gap-2.5 rounded-full border border-(--border-strong) bg-(--surface) px-7 py-3.5 text-base font-semibold text-(--text) shadow-sm transition-colors duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:bg-(--surface-2)"
            >
              <Compass size={18} className="text-(--accent)" />
              <span>{isAuthenticated ? "Browse Video Feed" : "Explore Videos as Guest"}</span>
            </Link>
          </div>

            {/* Hero Visual Mockup Preview */}
            <div className="relative mx-auto mt-14 max-w-5xl mb-12 sm:mb-16">
              {/* Ambient Glow behind the player */}
              <div className="pointer-events-none absolute -inset-2 sm:-inset-4 rounded-3xl bg-gradient-to-r from-(--accent)/25 via-rose-500/15 to-amber-500/15 blur-2xl opacity-70 transition-opacity duration-500" />

              {/* Main Player Card */}
              <div className="group relative rounded-3xl border border-(--border-strong) bg-(--surface) p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-colors duration-300 hover:border-(--accent)/40">
                {/* Video Player Screen (overflow-hidden scoped to the screen) */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col justify-between p-4 sm:p-6 select-none">
                  {/* Dynamic Video Poster or Stylized Cinematic Backdrop */}
                  {featuredVideo?.thumbnail ? (
                    <img
                      src={featuredVideo.thumbnail}
                      alt={featuredVideo.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    /* Fallback decorative studio visual (never plain gray) */
                    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-black">
                      <div className="absolute -left-1/4 -top-1/4 h-3/4 w-3/4 rounded-full bg-(--accent)/15 blur-3xl" />
                      <div className="absolute -right-1/4 -bottom-1/4 h-3/4 w-3/4 rounded-full bg-blue-600/10 blur-3xl" />
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
                    </div>
                  )}

                  {/* High-contrast multi-stop gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/75 pointer-events-none" />

                  {/* Top Player Status Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      <span>{featuredVideo ? "Featured Spotlight" : "MyTube 4K Live Experience"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md">
                        4K HDR
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-(--accent)/30 bg-(--accent)/20 px-2.5 py-1 text-[11px] font-medium text-red-200 backdrop-blur-md">
                        <Radio size={12} className="text-(--accent) animate-pulse" />
                        <span>Ultra Low Latency</span>
                      </span>
                    </div>
                  </div>

                  {/* Center Play Interaction Overlay */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4 py-2">
                    <Link
                      to={
                        featuredVideo
                          ? `/video/${featuredVideo._id}`
                          : isAuthenticated
                            ? "/home"
                            : "/explore"
                      }
                      className="group/play flex flex-col items-center justify-center gap-3 transition-transform duration-300 hover:scale-105"
                      aria-label="Play Featured Video"
                    >
                      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-(--accent) text-white shadow-[0_0_35px_rgba(229,57,53,0.6)] transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-(--accent-strong) group-hover/play:shadow-[0_0_55px_rgba(229,57,53,0.9)]">
                        <Play size={28} className="ml-1 fill-white sm:h-8 sm:w-8" />
                      </div>

                      <div className="max-w-xl">
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-white drop-shadow-md line-clamp-1">
                          {featuredVideo?.title || "Explore Trending Creators, Videos & Micro-Tweets"}
                        </p>
                        <p className="text-xs sm:text-sm text-white/80 mt-1 drop-shadow flex items-center justify-center gap-1.5">
                          {featuredVideo?.owner?.fullName ? (
                            <span>By {featuredVideo.owner.fullName} • Click to Watch Now</span>
                          ) : (
                            <span>Click to launch high-definition playback</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Bottom Player Timeline & Controls Bar */}
                  <div className="relative z-10 space-y-2.5">
                    {/* Scrub bar */}
                    <div className="relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/25 backdrop-blur-sm">
                      <div className="absolute left-0 top-0 h-full w-3/4 rounded-full bg-white/30" />
                      <div className="relative h-full w-2/5 rounded-full bg-gradient-to-r from-red-600 to-(--accent)" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/90">
                      <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs text-white/85">
                        <span>
                          05:18 / {featuredVideo ? formatDuration(featuredVideo.duration) : "22:45"}
                        </span>
                        <div className="hidden sm:flex items-center gap-1.5 text-white/70 font-sans">
                          <Volume2 size={13} />
                          <span className="text-[11px]">Stereo 320k</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-block text-[11px] font-medium text-white/70">
                          1080p60 • Seamless
                        </span>
                        <Maximize2 size={14} className="text-white/80" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stat Pill 1 (Left - position outside overflow-hidden with elevation) */}
              <div className="hidden sm:flex absolute -bottom-5 sm:-bottom-6 left-6 lg:left-8 z-20 items-center gap-3 rounded-2xl border border-(--border-strong) bg-(--surface)/95 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-soft) text-(--accent)">
                  <TrendingUp size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-(--muted)">Live Audience</p>
                  <p className="text-sm font-bold text-(--text)">99.4% Positive</p>
                </div>
              </div>

              {/* Floating Stat Pill 2 (Right - position outside overflow-hidden with elevation) */}
              <div className="hidden sm:flex absolute -bottom-5 sm:-bottom-6 right-6 lg:right-8 z-20 items-center gap-3 rounded-2xl border border-(--border-strong) bg-(--surface)/95 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-(--muted)">Creator Community</p>
                  <p className="text-sm font-bold text-(--text)">Global Network</p>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-y border-(--border) bg-(--surface)/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold tracking-tight text-(--accent) sm:text-4xl tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-(--muted) uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending Videos Live Showcase ─── */}
      <section id="trending" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium text-(--accent)">
                <Tv size={14} />
                <span>Real-Time Catalog</span>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-(--text)">
                Trending on MyTube
              </h2>
              <p className="mt-2 text-sm text-(--muted) sm:text-base">
                Discover what the community is watching, liking, and talking about right now.
              </p>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--text) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-2) self-start md:self-auto"
            >
              <span>View All Videos</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loadingVideos ? (
            <SkeletonGrid count={4} />
          ) : trendingVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trendingVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-(--border) bg-(--surface) p-10 text-center">
              <p className="text-base text-(--muted)">No videos uploaded yet.</p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2 text-sm font-medium text-white"
              >
                Be the first creator to upload!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Core Features Bento Grid ─── */}
      <section id="features" className="border-t border-(--border) bg-(--surface)/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium text-(--muted)">
              <Sparkles size={14} className="text-(--accent)" />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-(--text)">
              Engineered for Creators & Audiences
            </h2>
            <p className="mt-2 text-sm text-(--muted) sm:text-base">
              Everything you need to stream, share, monetize your reach, and connect seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-7 shadow-(--shadow-sm) transition-transform transition-colors duration-300 hover:-translate-y-1.5 hover:border-(--border-strong) hover:shadow-(--shadow)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent-soft) text-(--accent) transition-transform duration-300 group-hover:scale-110">
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full border border-(--border) bg-(--surface-2) px-3 py-1 text-xs font-medium text-(--muted)">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg sm:text-xl font-semibold tracking-tight text-(--text)">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="border-t border-(--border) py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-(--text)">
              Launch in 3 Simple Steps
            </h2>
            <p className="mt-2 text-sm text-(--muted) sm:text-base">
              Start publishing your videos and building your audience today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative rounded-3xl border border-(--border) bg-(--surface) p-8 shadow-sm"
              >
                <span className="text-3xl sm:text-4xl font-bold text-(--accent)">
                  {step.num}
                </span>
                <h3 className="mt-4 text-base sm:text-lg font-semibold tracking-tight text-(--text)">{step.title}</h3>
                <p className="mt-2 text-sm text-(--muted) leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border-strong) bg-gradient-to-br from-(--surface-2) via-(--surface) to-(--surface-2) p-8 sm:p-14 text-center shadow-2xl">
            {/* Ambient Glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-(--accent-soft) blur-3xl opacity-25" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-(--accent-soft) blur-3xl opacity-25" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-(--text)">
                Ready to Share Your Voice?
              </h2>
              <p className="mt-4 text-base text-(--muted) sm:text-lg">
                Join thousands of creators and viewers. Enjoy fast streaming, community tweets, and custom channel management today.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/home" : "/register"}
                  className="inline-flex items-center gap-2.5 rounded-full bg-(--accent) px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/20 transition-colors duration-300 hover:-translate-y-1 hover:bg-(--accent-strong)"
                >
                  <span>{isAuthenticated ? "Go to Video Feed" : "Get Started Now"}</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to={isAuthenticated ? "/home" : "/explore"}
                  className="inline-flex items-center gap-2.5 rounded-full border border-(--border) bg-(--surface) px-7 py-3.5 text-base font-medium text-(--text) transition-colors duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:bg-(--surface-2)"
                >
                  <Compass size={18} />
                  <span>{isAuthenticated ? "Browse Video Feed" : "Browse Catalog"}</span>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-(--muted)">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Instant setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-(--border) bg-(--bg) py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-(--accent)">My</span>
                <span className="text-(--text)">Tube</span>
              </span>
              <span className="text-xs text-(--muted-strong)">
                © {new Date().getFullYear()} MyTube. All rights reserved.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-(--muted)">
              {isAuthenticated && (
                <Link to="/home" className="hover:text-(--text) transition-colors">
                  Feed
                </Link>
              )}
              <Link to="/explore" className="hover:text-(--text) transition-colors">
                Explore
              </Link>
              <a href="#features" className="hover:text-(--text) transition-colors">
                Features
              </a>
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="hover:text-(--text) transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="hover:text-(--text) transition-colors">
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="hover:text-(--text) transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
