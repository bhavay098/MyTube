import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  UserPlus,
  Play,
  ListMusic,
  MessageSquareText,
  Info,
  Calendar,
  Heart
} from "lucide-react";
import { useSelector } from "react-redux";
import { format } from "timeago.js";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { SkeletonLine, SkeletonGrid } from "../components/ui/Skeleton.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

import { getChannelProfileByUsername } from "../services/user.service.js";
import { toggleSubscription } from "../services/subscription.service.js";
import { getAllVideos } from "../services/video.service.js";
import { getUserPlaylists } from "../services/playlist.service.js";
import { getUserTweets } from "../services/tweet.service.js";

const ChannelProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  // Tab content states
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const fetchProfileAndContent = async () => {
    try {
      setLoading(true);
      const data = await getChannelProfileByUsername(username);
      setProfile(data);

      if (data?._id) {
        loadTabContent("videos", data._id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load channel profile");
    } finally {
      setLoading(false);
    }
  };

  const loadTabContent = async (tab, userId) => {
    const targetUserId = userId || profile?._id;
    if (!targetUserId) return;

    try {
      setTabLoading(true);
      if (tab === "videos") {
        const vData = await getAllVideos({ userId: targetUserId, limit: 30 });
        setVideos(vData?.videos || []);
      } else if (tab === "playlists") {
        const pData = await getUserPlaylists(targetUserId);
        setPlaylists(pData || []);
      } else if (tab === "community") {
        const tData = await getUserTweets(targetUserId);
        setTweets(tData || []);
      }
    } catch (error) {
      console.error(`Failed to load ${tab}:`, error);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndContent();
  }, [username]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTabContent(tab);
  };

  const handleSubscribeToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to subscribe to channels");
      navigate("/login", { state: { from: `/channel/${username}` } });
      return;
    }
    if (!profile?._id) return;
    try {
      setSubscribing(true);
      const res = await toggleSubscription(profile._id);
      const isNowSubscribed = res?.data?.isSubscribed;
      setProfile((prev) => ({
        ...prev,
        isSubscribed: isNowSubscribed,
        subscribersCount: isNowSubscribed
          ? (prev.subscribersCount || 0) + 1
          : Math.max(0, (prev.subscribersCount || 0) - 1),
      }));
      toast.success(
        isNowSubscribed
          ? "Subscribed successfully"
          : "Unsubscribed successfully",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update subscription",
      );
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="skeleton-shimmer h-48 w-full rounded-3xl sm:h-64" />
          <div className="flex items-center gap-5">
            <div className="skeleton-shimmer h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <SkeletonLine width="w-48" height="h-7" />
              <SkeletonLine width="w-32" height="h-4" />
            </div>
          </div>
          <SkeletonGrid count={6} />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-semibold tracking-tight text-(--text)">Channel not found</p>
          <p className="mt-2 text-sm text-(--muted)">
            This channel may not exist or has been removed.
          </p>
          <Link
            to="/explore"
            className="mt-5 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-(--accent-strong)"
          >
            Explore Channels
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?._id === profile?._id;

  const tabs = [
    { id: "videos", label: "Videos", icon: Play, count: videos.length },
    { id: "playlists", label: "Playlists", icon: ListMusic, count: playlists.length },
    { id: "community", label: "Community", icon: MessageSquareText, count: tweets.length },
    { id: "about", label: "About", icon: Info },
  ];

  const renderTabContent = () => {
    if (tabLoading) {
      return <SkeletonGrid count={6} />;
    }

    if (activeTab === "videos") {
      if (videos.length === 0) {
        return (
          <EmptyState
            icon="video"
            title="No videos yet"
            description={
              isOwnProfile
                ? "You haven't uploaded any videos yet."
                : `${profile.fullName} hasn't uploaded any videos yet.`
            }
            actionLabel={isOwnProfile ? "Upload Video" : undefined}
            onAction={isOwnProfile ? () => navigate("/upload") : undefined}
          />
        );
      }
      return <VideoGrid videos={videos} />;
    }

    if (activeTab === "playlists") {
      if (playlists.length === 0) {
        return (
          <EmptyState
            icon="playlist"
            title="No playlists yet"
            description={
              isOwnProfile
                ? "You haven't created any playlists yet."
                : `${profile.fullName} has no public playlists.`
            }
            actionLabel={isOwnProfile ? "Create Playlist" : undefined}
            onAction={isOwnProfile ? () => navigate("/playlists") : undefined}
          />
        );
      }
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              to="/playlists"
              className="group rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm) transition-all duration-300 hover:-translate-y-1 hover:border-(--accent)"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-(--surface-2)">
                {playlist.videos?.[0]?.thumbnail ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={playlist.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-(--muted)">
                    <ListMusic size={32} />
                  </div>
                )}
                <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-black/70 backdrop-blur-xs text-white">
                  <div className="text-center">
                    <ListMusic size={20} className="mx-auto" />
                    <span className="mt-1 block text-xs font-semibold">
                      {playlist.videos?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-sm sm:text-base text-(--text) group-hover:text-(--accent) transition-colors">
                {playlist.name}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-(--muted)">
                {playlist.description || "No description"}
              </p>
            </Link>
          ))}
        </div>
      );
    }

    if (activeTab === "community") {
      if (tweets.length === 0) {
        return (
          <EmptyState
            icon="tweet"
            title="No community posts"
            description={
              isOwnProfile
                ? "Share updates and thoughts with your audience."
                : `${profile.fullName} hasn't posted anything in the community tab yet.`
            }
            actionLabel={isOwnProfile ? "Post a Tweet" : undefined}
            onAction={isOwnProfile ? () => navigate("/tweets") : undefined}
          />
        );
      }
      return (
        <div className="space-y-4 max-w-2xl">
          {tweets.map((tweet) => (
            <article
              key={tweet._id}
              className="rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all hover:border-(--border-strong)"
            >
              <div className="flex gap-3.5">
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-(--text)">
                      {profile.fullName}
                    </span>
                    <span className="text-xs text-(--muted)">
                      @{profile.username}
                    </span>
                    {tweet.createdAt && (
                      <>
                        <span className="text-xs text-(--muted-strong)">•</span>
                        <span className="text-xs text-(--muted-strong)">
                          {format(tweet.createdAt)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-(--text) whitespace-pre-wrap">
                    {tweet.content}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-(--muted)">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={13} className="text-(--accent)" />
                      {tweet.likesCount || tweet.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    }

    /* About Tab */
    return (
      <div className="max-w-2xl rounded-3xl border border-(--border) bg-(--surface) p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-(--text)">Description / Bio</h3>
          <p className="mt-2 text-sm leading-relaxed text-(--muted)">
            {profile.bio || `${profile.fullName} hasn't added a channel description yet.`}
          </p>
        </div>

        <div className="border-t border-(--border) pt-5 space-y-3">
          <h3 className="text-base font-semibold tracking-tight text-(--text)">Channel Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2.5 text-(--muted)">
              <Calendar size={16} className="text-(--accent)" />
              <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-(--muted)">
              <Users size={16} className="text-(--accent)" />
              <span>{profile.subscribersCount ?? 0} subscribers</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-5xl space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface)">
          <div className="h-48 w-full sm:h-64">
            <img
              src={profile.coverImage || profile.avatar}
              alt={`${profile.username}'s banner`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Profile Header Bar */}
          <div className="relative z-10 -mt-16 flex flex-wrap items-end justify-between gap-4 p-6 sm:px-8">
            <div className="flex items-end gap-5">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="h-28 w-28 rounded-full border-4 border-(--bg) bg-(--surface) object-cover shadow-2xl"
              />
              <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-md">
                  {profile.fullName}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                  <span>@{profile.username}</span>
                  <span>•</span>
                  <span>{profile.subscribersCount ?? 0} subscribers</span>
                  <span>•</span>
                  <span>{profile.channelsSubscribedToCount ?? 0} subscribed</span>
                </div>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-3">
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/90 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-(--text) transition-all hover:bg-(--surface-2)"
                >
                  Customize Channel
                </Link>
              ) : (
                <button
                  onClick={handleSubscribeToggle}
                  disabled={subscribing}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-lg ${
                    profile.isSubscribed
                      ? "border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-(--error) hover:border-(--error)"
                      : "bg-(--accent) text-white hover:bg-(--accent-strong)"
                  } disabled:opacity-50`}
                >
                  {subscribing ? (
                    <Spinner size={15} />
                  ) : profile.isSubscribed ? (
                    <>
                      <UserCheck size={15} />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex border-b border-(--border) gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-(--accent)"
                    : "text-(--muted) hover:text-(--text)"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      isActive
                        ? "bg-(--accent-soft) text-(--accent)"
                        : "bg-(--surface-2) text-(--muted)"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="pt-2">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default ChannelProfile;
