import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../services/subscription.service.js";

const Subscriptions = () => {
  const user = useSelector((state) => state.auth.user);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

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
      }
    };

    fetchData();
  }, [user?._id]);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Subscriptions</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text)">
            Your Subscribers
          </h2>
          <div className="space-y-3">
            {subscribers.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-(--border) bg-(--surface-2) p-3 text-sm text-(--text)"
              >
                {item?.subscriber?.fullName || item?.subscriber?.username}
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-(--muted)">No subscribers yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text)">
            Channels You Follow
          </h2>
          <div className="space-y-3">
            {subscriptions.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-(--border) bg-(--surface-2) p-3 text-sm text-(--text)"
              >
                {item?.channel?.fullName || item?.channel?.username}
              </div>
            ))}
            {subscriptions.length === 0 && (
              <p className="text-(--muted)">You are not following any channels.</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Subscriptions;
