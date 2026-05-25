import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
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
    try {
      await createPlaylist(form);
      setForm({ name: "", description: "" });
      await fetchPlaylists();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create playlist");
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

  const handleDelete = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      setSelectedPlaylist(null);
      await fetchPlaylists();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete playlist");
    }
  };

  const handleUpdate = async (playlist) => {
    const name = window.prompt("Playlist name", playlist.name);
    const description = window.prompt("Playlist description", playlist.description);
    if (!name && !description) return;
    try {
      await updatePlaylist(playlist._id, { name, description });
      await fetchPlaylists();
      if (selectedPlaylist?._id === playlist._id) {
        await handleSelectPlaylist(playlist._id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update playlist");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!selectedPlaylist?._id) return;
    try {
      await removeVideoFromPlaylist(videoId, selectedPlaylist._id);
      await handleSelectPlaylist(selectedPlaylist._id);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove video");
    }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-(--text)">My Playlists</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text)">
            Create Playlist
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Playlist name"
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Description"
              rows={3}
              className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
            />
            <button className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white">
              Create
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text)">Your Lists</h2>
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) p-3"
              >
                <button
                  onClick={() => handleSelectPlaylist(playlist._id)}
                  className="text-left text-sm text-(--text)"
                >
                  {playlist.name}
                </button>
                <button
                  onClick={() => handleDelete(playlist._id)}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleUpdate(playlist)}
                  className="text-xs text-(--muted)"
                >
                  Edit
                </button>
              </div>
            ))}
            {playlists.length === 0 && (
              <p className="text-(--muted)">No playlists yet.</p>
            )}
          </div>
        </section>
      </div>

      {selectedPlaylist && (
        <section className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-5">
          <h2 className="text-lg font-semibold text-(--text)">
            {selectedPlaylist.name}
          </h2>
          <p className="mt-2 text-sm text-(--muted)">
            {selectedPlaylist.description}
          </p>
          <div className="mt-4 space-y-2">
            {(selectedPlaylist.videos || []).map((video) => (
              <div
                key={video._id}
                className="flex items-center justify-between text-sm text-(--text)"
              >
                <span>{video.title}</span>
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="text-xs text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
            {(selectedPlaylist.videos || []).length === 0 && (
              <p className="text-(--muted)">No videos in this playlist yet.</p>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Playlists;
