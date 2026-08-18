import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Camera,
  ImagePlus,
  Save,
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { setUser } from "../store/authSlice.js";
import {
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../services/user.service.js";

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [accountLoading, setAccountLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    try {
      setAccountLoading(true);
      const data = await updateAccountDetails(accountForm);
      dispatch(setUser(data));
      toast.success("Account updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update account");
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      setPasswordLoading(true);
      await changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await updateAvatar(formData);
      dispatch(setUser(data));
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setCoverLoading(true);
      const formData = new FormData();
      formData.append("coverImage", file);
      const data = await updateCoverImage(formData);
      dispatch(setUser(data));
      toast.success("Cover image updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update cover image",
      );
    } finally {
      setCoverLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <SettingsIcon size={20} className="text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-(--text)">Settings</h1>
            <p className="text-sm text-(--muted)">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Profile Images */}
        <section className="mb-6 rounded-2xl border border-(--border) bg-(--surface) p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text)">
            <Camera size={18} className="text-(--accent)" />
            Profile Images
          </h2>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="group relative">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="h-24 w-24 rounded-full border-2 border-(--border) object-cover"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {avatarLoading ? (
                    <Spinner size={20} className="text-white" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <span className="text-xs text-(--muted)">Avatar</span>
            </div>

            {/* Cover */}
            <div className="flex-1">
              <div className="group relative overflow-hidden rounded-xl">
                {user?.coverImage ? (
                  <img
                    src={user.coverImage}
                    alt="Cover"
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-(--surface-2)">
                    <ImagePlus size={24} className="text-(--muted-strong)" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverLoading}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {coverLoading ? (
                    <Spinner size={20} className="text-white" />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white">
                      <Camera size={14} />
                      Change Cover
                    </div>
                  )}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>
              <span className="mt-1 block text-xs text-(--muted)">
                Cover Image — recommended 1200×400
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Account */}
          <form
            onSubmit={handleAccountSubmit}
            className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text)">
              <User size={18} className="text-(--accent)" />
              Account
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Full Name
              </label>
              <input
                value={accountForm.fullName}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Email
              </label>
              <input
                value={accountForm.email}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                placeholder="Email"
              />
            </div>
            <button
              type="submit"
              disabled={accountLoading}
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-50"
            >
              {accountLoading ? <Spinner size={14} /> : <Save size={14} />}
              Save Account
            </button>
          </form>

          {/* Password */}
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text)">
              <Lock size={18} className="text-(--accent)" />
              Password
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    oldPassword: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-50"
            >
              {passwordLoading ? <Spinner size={14} /> : <Lock size={14} />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
