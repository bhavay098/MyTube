import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, ImagePlus, Lock, Save, Settings as SettingsIcon, Trash2, User } from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { logoutUser, setUser } from "../store/authSlice.js";
import { changePassword, deleteAccount, updateAccountDetails, updateAvatar, updateCoverImage } from "../services/user.service.js";

const SettingsProfileImages = ({ user, avatarInputRef, coverInputRef, avatarLoading, coverLoading, onAvatarUpload, onCoverUpload }) => (
  <section className="mb-6 rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)"><Camera size={18} className="text-(--accent)" />Profile Images</h2>
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-3"><div className="group relative"><img src={user?.avatar} alt={user?.username} className="h-24 w-24 rounded-full border-2 border-(--border) object-cover" /><button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarLoading} className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">{avatarLoading ? <Spinner size={20} className="text-white" /> : <Camera size={20} className="text-white" />}</button><input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarUpload} className="hidden" /></div><span className="text-xs font-medium text-(--muted)">Avatar</span></div>
      <div className="flex-1"><div className="group relative overflow-hidden rounded-2xl border border-(--border)">{user?.coverImage ? <img src={user.coverImage} alt="Cover" className="h-32 w-full object-cover" /> : <div className="flex h-32 w-full items-center justify-center bg-(--surface-2)"><ImagePlus size={24} className="text-(--muted-strong)" /></div>}<button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverLoading} className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">{coverLoading ? <Spinner size={20} className="text-white" /> : <span className="flex items-center gap-2 rounded-xl bg-black/60 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md"><Camera size={14} />Change Banner</span>}</button><input ref={coverInputRef} type="file" accept="image/*" onChange={onCoverUpload} className="hidden" /></div><span className="mt-1.5 block text-xs text-(--muted)">Channel Banner — recommended 1200×400</span></div>
    </div>
  </section>
);

const SettingsAccountForm = ({ accountForm, loading, onChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)"><User size={18} className="text-(--accent)" />Account & Bio</h2>
    <div><label htmlFor="settings-fullname" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)">Full Name</label><input id="settings-fullname" value={accountForm.fullName} onChange={(event) => onChange("fullName", event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Full name" /></div>
    <div><label htmlFor="settings-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)">Email</label><input id="settings-email" value={accountForm.email} onChange={(event) => onChange("email", event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Email" /></div>
    <div><label htmlFor="settings-bio" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)">Channel Bio / Description</label><textarea id="settings-bio" value={accountForm.bio} onChange={(event) => onChange("bio", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Tell viewers about you or your channel..." /></div>
    <button type="submit" disabled={loading} className="flex cursor-pointer items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50">{loading ? <Spinner size={14} /> : <Save size={14} />}Save Changes</button>
  </form>
);

const SettingsPasswordForm = ({ passwordForm, loading, onChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)"><Lock size={18} className="text-(--accent)" />Security</h2>
    <div><label htmlFor="settings-oldpassword" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)">Current Password</label><input id="settings-oldpassword" type="password" value={passwordForm.oldPassword} onChange={(event) => onChange("oldPassword", event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Enter current password" /></div>
    <div><label htmlFor="settings-newpassword" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)">New Password</label><input id="settings-newpassword" type="password" value={passwordForm.newPassword} onChange={(event) => onChange("newPassword", event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Enter new password" /></div>
    <button type="submit" disabled={loading} className="flex cursor-pointer items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50">{loading ? <Spinner size={14} /> : <Lock size={14} />}Update Password</button>
  </form>
);

const SettingsDangerZone = ({ onDelete }) => (
  <section className="mt-6 rounded-3xl border border-(--error)/30 bg-(--surface) p-6 shadow-(--shadow-sm)"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-(--error)"><Trash2 size={18} />Delete Account</h2><p className="mt-1 max-w-xl text-sm text-(--muted)">Permanently delete your profile, videos, posts, playlists, and account data. This action cannot be undone.</p></div><button type="button" onClick={onDelete} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--error) px-4 py-2.5 text-xs font-semibold text-(--error) transition-colors duration-200 hover:bg-(--error) hover:text-white"><Trash2 size={14} />Delete Account</button></div></section>
);

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [accountForm, setAccountForm] = useState({ fullName: user?.fullName || "", email: user?.email || "", bio: user?.bio || "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [accountLoading, setAccountLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    try { setAccountLoading(true); const data = await updateAccountDetails(accountForm); dispatch(setUser(data)); toast.success("Account updated"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to update account"); } finally { setAccountLoading(false); }
  };
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    try { setPasswordLoading(true); await changePassword(passwordForm); setPasswordForm({ oldPassword: "", newPassword: "" }); toast.success("Password changed"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to change password"); } finally { setPasswordLoading(false); }
  };
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { setAvatarLoading(true); const formData = new FormData(); formData.append("avatar", file); const data = await updateAvatar(formData); dispatch(setUser(data)); toast.success("Avatar updated"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to update avatar"); } finally { setAvatarLoading(false); }
  };
  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { setCoverLoading(true); const formData = new FormData(); formData.append("coverImage", file); const data = await updateCoverImage(formData); dispatch(setUser(data)); toast.success("Cover image updated"); } catch (error) { toast.error(error?.response?.data?.message || "Failed to update cover image"); } finally { setCoverLoading(false); }
  };
  const handleDeleteAccount = async () => {
    try { setDeleteLoading(true); await deleteAccount(); dispatch(logoutUser()); toast.success("Account deleted"); navigate("/", { replace: true }); } catch (error) { toast.error(error?.response?.data?.message || "Failed to delete account"); } finally { setDeleteLoading(false); setDeleteDialogOpen(false); }
  };

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)"><SettingsIcon size={20} className="text-(--accent)" /></div><div><h1 className="text-2xl font-semibold tracking-tight text-(--text)">Settings</h1><p className="text-sm text-(--muted)">Manage your account and channel preferences</p></div></div>
        <SettingsProfileImages user={user} avatarInputRef={avatarInputRef} coverInputRef={coverInputRef} avatarLoading={avatarLoading} coverLoading={coverLoading} onAvatarUpload={handleAvatarUpload} onCoverUpload={handleCoverUpload} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><SettingsAccountForm accountForm={accountForm} loading={accountLoading} onChange={(field, value) => setAccountForm((current) => ({ ...current, [field]: value }))} onSubmit={handleAccountSubmit} /><SettingsPasswordForm passwordForm={passwordForm} loading={passwordLoading} onChange={(field, value) => setPasswordForm((current) => ({ ...current, [field]: value }))} onSubmit={handlePasswordSubmit} /></div>
        <SettingsDangerZone onDelete={() => setDeleteDialogOpen(true)} />
      </div>
      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDeleteAccount} title="Delete your account?" description="This permanently deletes your profile, videos, posts, playlists, and related data. You will not be able to recover it." confirmLabel="Delete Account" loading={deleteLoading} />
    </Layout>
  );
};

export default Settings;
