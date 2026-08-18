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
} from "lucide-react";
import { toggleTheme } from "../store/themeSlice.js";
import { getAllVideos } from "../services/video.service.js";
import VideoCard from "../components/video/VideoCard.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";

const Landing = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoadingVideos(true);
        const data = await getAllVideos({
          page: 1,
          limit: 4,
        });
        setTrendingVideos(data?.videos || []);
      } catch (error) {
        console.error("Failed to fetch trending videos for landing page:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchTrending();
  }, []);

  const features = [
    {
      icon: Video,
      title: "Crystal-Clear Video Streaming",
      description:
        "High-performance video delivery with adaptive quality, seamless playback, customizable thumbnails, and smart watch history tracking.",
      badge: "4K Ready",
      color: "from-red-500/20 to-orange-500/20",
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

  const stats = [
    { value: "4K HD", label: "Streaming Quality" },
    { value: "0 ms", label: "Buffer Lag" },
    { value: "100%", label: "Free & Open for Creators" },
    { value: "24/7", label: "Community Engagement" },
  ];

  const steps = [
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

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) selection:bg-(--accent) selection:text-white">
      {/* ─── Top Landing Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-(--border) bg-(--bg)/80 backdrop-blur-xl transition-all duration-300">
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2)"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/login"
              className="hidden rounded-full border border-(--border) px-4 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2) sm:inline-flex"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-(--accent-soft) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] max-w-full rounded-full bg-gradient-to-tr from-(--accent-soft) via-(--accent-soft) to-transparent blur-[120px] opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--surface)/80 px-4 py-1.5 text-xs font-medium text-(--accent) backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="animate-pulse" />
            <span className="tracking-wide uppercase">The Next-Gen Creator & Video Hub</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Where Content Meets <br />
            <span className="bg-gradient-to-r from-(--accent) via-[#ff4d6a] to-(--accent-strong) bg-clip-text text-transparent">
              Community & Growth
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-(--muted) sm:text-lg lg:text-xl leading-relaxed">
            Experience ultra-smooth video streaming, engage directly through community tweets, manage playlists, and unlock deep real-time analytics in your custom Creator Studio.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-full bg-(--accent) px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-(--accent-soft) transition-all duration-300 hover:-translate-y-1 hover:bg-(--accent-strong)"
            >
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2.5 rounded-full border border-(--border-strong) bg-(--surface) px-7 py-3.5 text-base font-semibold text-(--text) shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--accent) hover:bg-(--surface-2)"
            >
              <Compass size={18} className="text-(--accent)" />
              <span>Explore Videos as Guest</span>
            </Link>
          </div>

          {/* Hero Visual Mockup Preview */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl border border-(--border-strong) bg-(--surface) p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
              {/* Fake Video Player Bar */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-(--surface-2) flex flex-col justify-between p-4 sm:p-6">
                {/* Top Overlay Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>MyTube Live Experience</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                    <Radio size={14} className="text-(--accent)" />
                    <span>Ultra HD 4K Playback</span>
                  </div>
                </div>

                {/* Center Big Play Button Mock */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <Link
                    to="/explore"
                    className="group flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-(--accent) text-white shadow-2xl shadow-(--accent-soft) transition-all duration-300 hover:scale-110 hover:bg-(--accent-strong)"
                    aria-label="Start Watching"
                  >
                    <Play size={28} className="ml-1 fill-white" />
                  </Link>
                  <span className="mt-4 text-xs sm:text-sm font-medium text-white/90 drop-shadow">
                    Click to launch video catalog
                  </span>
                </div>

                {/* Bottom Player Controls Mock */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-2/3 rounded-full bg-(--accent)" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="font-mono">14:20 / 22:45</span>
                    <span className="font-semibold text-white">Full HD 1080p60</span>
                  </div>
                </div>
              </div>

              {/* Floating Stat Pill 1 (Left) */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft) text-(--accent)">
                  <TrendingUp size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-(--muted)">Engagement Rate</p>
                  <p className="text-sm font-semibold text-(--text)">99.4% Positive</p>
                </div>
              </div>

              {/* Floating Stat Pill 2 (Right) */}
              <div className="hidden sm:flex absolute -bottom-6 -right-6 items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-(--muted)">Creator Community</p>
                  <p className="text-sm font-semibold text-(--text)">Worldwide Audience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-y border-(--border) bg-(--surface)/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
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
              className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--text) transition-all duration-200 hover:border-(--accent) hover:bg-(--surface-2) hover:text-(--accent) self-start md:self-auto"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium text-(--accent)">
              <Sparkles size={14} />
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
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-7 shadow-(--shadow-sm) transition-all duration-300 hover:-translate-y-1.5 hover:border-(--accent) hover:shadow-(--shadow)"
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
            {steps.map((step, i) => (
              <div
                key={i}
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
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-(--accent-soft) blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-(--accent-soft) blur-3xl opacity-70" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-(--text)">
                Ready to Share Your Voice?
              </h2>
              <p className="mt-4 text-base text-(--muted) sm:text-lg">
                Join thousands of creators and viewers. Enjoy fast streaming, community tweets, and custom channel management today.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2.5 rounded-full bg-(--accent) px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-(--accent-soft) transition-all duration-300 hover:-translate-y-1 hover:bg-(--accent-strong)"
                >
                  <span>Get Started Now</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2.5 rounded-full border border-(--border) bg-(--surface) px-7 py-3.5 text-base font-medium text-(--text) transition-all duration-300 hover:-translate-y-1 hover:border-(--accent) hover:bg-(--surface-2)"
                >
                  <Compass size={18} />
                  <span>Browse Catalog</span>
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
              <Link to="/explore" className="hover:text-(--text) transition-colors">
                Explore
              </Link>
              <a href="#features" className="hover:text-(--text) transition-colors">
                Features
              </a>
              <Link to="/login" className="hover:text-(--text) transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-(--text) transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
