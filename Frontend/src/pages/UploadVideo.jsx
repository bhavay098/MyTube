import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import { publishVideo } from "../services/video.service.js";

const UploadVideo = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!videoFile || !thumbnail) {
      toast.error("Video file and thumbnail are required");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("videoFile", videoFile);
      payload.append("thumbnail", thumbnail);

      await publishVideo(payload);
      toast.success("Video uploaded");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl rounded-2xl border border-(--border) bg-(--surface) p-6">
        <h1 className="mb-5 text-2xl font-bold text-(--text)">Upload Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Title"
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
            rows={4}
            placeholder="Description"
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2 text-(--text)"
          />
          <label className="block rounded-xl border border-(--border) bg-(--surface-2) p-4 text-sm text-(--text)">
            Video File
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              className="mt-2 block w-full text-xs"
            />
          </label>
          <label className="block rounded-xl border border-(--border) bg-(--surface-2) p-4 text-sm text-(--text)">
            Thumbnail
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setThumbnail(event.target.files?.[0] || null)
              }
              className="mt-2 block w-full text-xs"
            />
          </label>
          <button
            disabled={loading}
            className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Publish"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default UploadVideo;
