import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import { getChannelProfileByUsername } from "../services/user.service.js";

const ChannelProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProfile();
  }, [username]);

  return (
    <Layout>
      {loading ? (
        <p className="text-(--muted)">Loading...</p>
      ) : !profile ? (
        <p className="text-(--muted)">Channel not found.</p>
      ) : (
        <div className="mx-auto max-w-4xl space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-6">
          <img
            src={profile.coverImage || profile.avatar}
            alt={profile.username}
            className="h-44 w-full rounded-xl object-cover"
          />
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="h-16 w-16 rounded-full border border-(--border) object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-(--text)">
                {profile.fullName}
              </h1>
              <p className="text-(--muted)">@{profile.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-(--border) p-4 text-(--text)">
              Subscribers: {profile.subscribersCount}
            </div>
            <div className="rounded-xl border border-(--border) p-4 text-(--text)">
              Subscribed To: {profile.channelsSubscribedToCount}
            </div>
            <div className="rounded-xl border border-(--border) p-4 text-(--text)">
              Is Subscribed: {profile.isSubscribed ? "Yes" : "No"}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ChannelProfile;
