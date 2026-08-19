import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Users, UserCheck } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../services/subscription.service.js";

const Subscriptions = () => {
  const user = useSelector((state) => state.auth.user);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [subscribersData, subscriptionsData] = await Promise.all([
          getUserChannelSubscribers(user._id),
          getSubscribedChannels(user._id),
        ]);
        setSubscribers(subscribersData?.subscribers || []);
        setSubscriptions(subscriptionsData?.subscriptions || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load subscriptions",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  if (loading) {
    return (
      <Layout>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-(--text)">Subscriptions</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5"
            >
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="skeleton-shimmer h-10 w-10 rounded-full" />
                  <SkeletonLine width="w-32" height="h-4" />
                </div>
              ))}
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
            <Users size={20} className="text-(--accent)" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Subscriptions</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Subscribers */}
          <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)">
              <Users size={18} className="text-(--accent)" />
              Your Subscribers
              {subscribers.length > 0 && (
                <span className="ml-auto rounded-full bg-(--accent-soft) px-2.5 py-0.5 text-xs font-medium text-(--accent)">
                  {subscribers.length}
                </span>
              )}
            </h2>
            <div className="space-y-2">
              {subscribers.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-2) p-3 transition-colors duration-200 hover:border-(--border-strong)"
                >
                  {item?.subscriber?.avatar ? (
                    <img
                      src={item.subscriber.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-3)">
                      <Users size={16} className="text-(--muted)" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-(--text)">
                      {item?.subscriber?.fullName ||
                        item?.subscriber?.username ||
                        "Unknown"}
                    </p>
                    {item?.subscriber?.username && (
                      <p className="text-xs text-(--muted)">
                        @{item.subscriber.username}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {subscribers.length === 0 && (
                <EmptyState
                  icon="users"
                  title="No subscribers yet"
                  description="Share your content to grow your audience"
                />
              )}
            </div>
          </section>

          {/* Subscribed channels */}
          <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)">
              <UserCheck size={18} className="text-(--accent)" />
              Channels You Follow
              {subscriptions.length > 0 && (
                <span className="ml-auto rounded-full bg-(--accent-soft) px-2.5 py-0.5 text-xs font-medium text-(--accent)">
                  {subscriptions.length}
                </span>
              )}
            </h2>
            <div className="space-y-2">
              {subscriptions.map((item) => (
                <Link
                  to={`/channel/${item?.channel?.username}`}
                  key={item._id}
                  className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-2) p-3 transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-3)"
                >
                  {item?.channel?.avatar ? (
                    <img
                      src={item.channel.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-3)">
                      <Users size={16} className="text-(--muted)" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-(--text)">
                      {item?.channel?.fullName ||
                        item?.channel?.username ||
                        "Unknown"}
                    </p>
                    {item?.channel?.username && (
                      <p className="text-xs text-(--muted)">
                        @{item.channel.username}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {subscriptions.length === 0 && (
                <EmptyState
                  icon="users"
                  title="Not following anyone"
                  description="Subscribe to channels to see them here"
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
