import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import { getChannelProfileByUsername } from "../services/user.service.js";
import { toggleSubscription } from "../services/subscription.service.js";

const ChannelProfile = () => {
  const { username } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getChannelProfileByUsername(username);
      setProfile(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const data = await getChannelProfileByUsername(username);
        if (isMounted) setProfile(data);
      } catch (error) {
        if (isMounted) {
          toast.error(error?.response?.data?.message || "Failed to load profile");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    const timerId = window.setTimeout(run, 0);
    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
    };
  }, [username]);

  const handleSubscribeToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to subscribe");
      return;
    }
    if (!profile?._id) return;
    try {
      setSubscribing(true);
      await toggleSubscription(profile._id);
      await fetchProfile();
      toast.success(
        profile.isSubscribed
          ? "Unsubscribed successfully"
          : "Subscribed successfully",
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
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="skeleton-shimmer h-48 w-full rounded-2xl" />
          <div className="flex items-center gap-4">
            <div className="skeleton-shimmer h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <SkeletonLine width="w-48" height="h-6" />
              <SkeletonLine width="w-32" height="h-4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-(--text)">
            Channel not found
          </p>
          <p className="mt-2 text-sm text-(--muted)">
            This channel may not exist or has been removed.
          </p>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?._id === profile?._id;

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-4xl">
        {/* Hero Banner */}
        <div className="relative">
          <div className="h-48 w-full overflow-hidden rounded-2xl sm:h-56">
            <img
              src={profile.coverImage || profile.avatar}
              alt={`${profile.username}'s banner`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Avatar & Channel info overlapping banner */}
          <div className="relative -mt-12 ml-6 flex flex-wrap items-end justify-between gap-4 pr-6 sm:ml-8">
            <div className="flex items-end gap-4">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="h-24 w-24 rounded-full border-4 border-(--bg) object-cover shadow-lg"
              />
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-(--text)">
                  {profile.fullName}
                </h1>
                <p className="text-sm text-(--muted)">@{profile.username}</p>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="mb-2">
                <button
                  onClick={handleSubscribeToggle}
                  disabled={subscribing}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    profile.isSubscribed
                      ? "border border-(--border) bg-(--surface-2) text-(--text) hover:border-(--error) hover:text-(--error)"
                      : "bg-(--accent) text-white hover:bg-(--accent-strong)"
                  } disabled:opacity-50`}
                >
                  {subscribing ? (
                    <Spinner size={16} />
                  ) : profile.isSubscribed ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {profile.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4 transition-all duration-200 hover:border-(--border-strong)">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
              <Users size={18} className="text-(--accent)" />
            </div>
            <div>
              <p className="text-xl font-bold text-(--text)">
                {profile.subscribersCount ?? 0}
              </p>
              <p className="text-xs text-(--muted)">Subscribers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4 transition-all duration-200 hover:border-(--border-strong)">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--info-soft)">
              <UserCheck size={18} className="text-(--info)" />
            </div>
            <div>
              <p className="text-xl font-bold text-(--text)">
                {profile.channelsSubscribedToCount ?? 0}
              </p>
              <p className="text-xs text-(--muted)">Subscribed To</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4 transition-all duration-200 hover:border-(--border-strong)">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                profile.isSubscribed
                  ? "bg-(--success-soft)"
                  : "bg-(--surface-2)"
              }`}
            >
              {profile.isSubscribed ? (
                <UserCheck size={18} className="text-(--success)" />
              ) : (
                <UserPlus size={18} className="text-(--muted)" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-(--text)">
                {profile.isSubscribed ? "Subscribed" : "Not Subscribed"}
              </p>
              <p className="text-xs text-(--muted)">Your status</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChannelProfile;
