import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
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

  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await updateAccountDetails(accountForm);
      dispatch(setUser(data));
      toast.success("Account updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update account");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      await changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await updateAvatar(formData);
      dispatch(setUser(data));
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update avatar");
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const data = await updateCoverImage(formData);
      dispatch(setUser(data));
      toast.success("Cover image updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update cover image",
      );
    }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleAccountSubmit}
          className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5"
        >
          <h2 className="text-lg font-semibold text-(--text)">Account</h2>
          <input
            value={accountForm.fullName}
            onChange={(event) =>
              setAccountForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            placeholder="Full name"
          />
          <input
            value={accountForm.email}
            onChange={(event) =>
              setAccountForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            placeholder="Email"
          />
          <button className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white">
            Save Account
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5"
        >
          <h2 className="text-lg font-semibold text-(--text)">Password</h2>
          <input
            type="password"
            value={passwordForm.oldPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                oldPassword: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            placeholder="Current password"
          />
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            placeholder="New password"
          />
          <button className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white">
            Change Password
          </button>
        </form>
      </div>

      <section className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <h2 className="mb-3 text-lg font-semibold text-(--text)">
          Avatar / Cover Image
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-(--border) bg-(--surface-2) p-4 text-sm text-(--text)">
            Upload Avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2 block w-full text-xs"
            />
          </label>

          <label className="rounded-xl border border-(--border) bg-(--surface-2) p-4 text-sm text-(--text)">
            Upload Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="mt-2 block w-full text-xs"
            />
          </label>
        </div>
      </section>
    </Layout>
  );
};

export default Settings;
