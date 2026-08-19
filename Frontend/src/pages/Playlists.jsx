import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Pencil,
  ListMusic,
  X,
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../services/playlist.service.js";

const Playlists = () => {
  const user = useSelector((state) => state.auth.user);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const editPlaylistRef = useRef(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deletePlaylistId, setDeletePlaylistId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlaylists = async () => {
    if (!user?._id) return;
    try {
      const data = await getUserPlaylists(user._id);
      setPlaylists(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load playlists");
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    const timerId = window.setTimeout(() => {
      const run = async () => {
        try {
          const data = await getUserPlaylists(user._id);
          setPlaylists(data || []);
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to load playlists",
          );
        }
      };
      run();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [user]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    try {
      setCreateLoading(true);
      await createPlaylist(form);
      setForm({ name: "", description: "" });
      await fetchPlaylists();
      toast.success("Playlist created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSelectPlaylist = async (playlistId) => {
    try {
      const data = await getPlaylistById(playlistId);
      setSelectedPlaylist(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load playlist");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deletePlaylist(deletePlaylistId);
      if (selectedPlaylist?._id === deletePlaylistId) {
        setSelectedPlaylist(null);
      }
      await fetchPlaylists();
      setDeletePlaylistId(null);
      toast.success("Playlist deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete playlist");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (playlist) => {
    editPlaylistRef.current = playlist;
    setEditForm({ name: playlist.name, description: playlist.description || "" });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editPlaylistRef.current) return;
    try {
      setEditLoading(true);
      await updatePlaylist(editPlaylistRef.current._id, editForm);
      await fetchPlaylists();
      if (selectedPlaylist?._id === editPlaylistRef.current._id) {
        await handleSelectPlaylist(editPlaylistRef.current._id);
      }
      setEditModalOpen(false);
      toast.success("Playlist updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update playlist");
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!selectedPlaylist?._id) return;
    try {
      await removeVideoFromPlaylist(videoId, selectedPlaylist._id);
      await handleSelectPlaylist(selectedPlaylist._id);
      toast.success("Video removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove video");
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <ListMusic size={20} className="text-(--accent)" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">My Playlists</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Create */}
          <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-(--text)">
              <Plus size={18} className="text-(--accent)" />
              Create Playlist
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label
                  htmlFor="create-playlist-name"
                  className="mb-1.5 block text-sm font-medium text-(--muted)"
                >
                  Name
                </label>
                <input
                  id="create-playlist-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="My awesome playlist"
                  className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
              </div>
              <div>
                <label
                  htmlFor="create-playlist-desc"
                  className="mb-1.5 block text-sm font-medium text-(--muted)"
                >
                  Description
                </label>
                <textarea
                  id="create-playlist-desc"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What's this playlist about?"
                  rows={3}
                  className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
              </div>
              <button
                type="submit"
                disabled={createLoading}
                className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50 cursor-pointer"
              >
                {createLoading && <Spinner size={14} />}
                Create
              </button>
            </form>
          </section>

          {/* List */}
          <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-(--text)">
              Your Lists
            </h2>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                    selectedPlaylist?._id === playlist._id
                      ? "border-(--accent) bg-(--accent-soft)"
                      : "border-(--border) bg-(--surface-2) hover:border-(--border-strong)"
                  }`}
                  onClick={() => handleSelectPlaylist(playlist._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--surface-3)">
                      <ListMusic size={16} className="text-(--muted)" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--text)">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {playlist.videos?.length || 0} videos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(playlist);
                      }}
                      className="rounded-lg p-2 text-(--muted) transition-colors hover:bg-(--surface-3) hover:text-(--text)"
                      aria-label="Edit playlist"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletePlaylistId(playlist._id);
                      }}
                      className="rounded-lg p-2 text-(--muted) transition-colors hover:bg-(--error-soft) hover:text-(--error)"
                      aria-label="Delete playlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && (
                <p className="py-6 text-center text-sm text-(--muted)">
                  No playlists yet. Create your first one!
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Selected Playlist */}
        {selectedPlaylist && (
          <section className="mt-6 animate-slide-up rounded-2xl border border-(--border) bg-(--surface) p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-(--text)">
                  {selectedPlaylist.name}
                </h2>
                {selectedPlaylist.description && (
                  <p className="mt-1 text-sm text-(--muted)">
                    {selectedPlaylist.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlaylist(null)}
                aria-label="Close playlist details"
                className="rounded-lg p-2 text-(--muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {(selectedPlaylist.videos || []).map((video) => (
                <div
                  key={video._id}
                  className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) p-3"
                >
                  <Link
                    to={`/video/${video._id}`}
                    className="flex items-center gap-3"
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="h-10 w-16 rounded-lg object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-(--text) hover:text-(--accent) transition-colors">
                      {video.title}
                    </span>
                  </Link>
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="rounded-lg p-2 text-(--muted) transition-colors hover:bg-(--error-soft) hover:text-(--error)"
                    aria-label="Remove video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(selectedPlaylist.videos || []).length === 0 && (
                <EmptyState
                  icon="video"
                  title="Empty playlist"
                  description="Add videos from the video detail page"
                />
              )}
            </div>
          </section>
        )}
      </div>

      {/* Edit Playlist Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Playlist"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="edit-playlist-name"
              className="mb-1.5 block text-sm font-medium text-(--muted)"
            >
              Name
            </label>
            <input
              id="edit-playlist-name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div>
            <label
              htmlFor="edit-playlist-desc"
              className="mb-1.5 block text-sm font-medium text-(--muted)"
            >
              Description
            </label>
            <textarea
              id="edit-playlist-desc"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium text-(--text) transition-colors hover:bg-(--surface-2)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong) disabled:opacity-50"
            >
              {editLoading && <Spinner size={14} />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Playlist Confirm */}
      <ConfirmDialog
        open={!!deletePlaylistId}
        onClose={() => setDeletePlaylistId(null)}
        onConfirm={handleDelete}
        title="Delete Playlist?"
        description="This playlist and its references will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default Playlists;
