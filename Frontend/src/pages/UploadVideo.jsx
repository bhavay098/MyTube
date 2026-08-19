import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload,
  Film,
  ImagePlus,
  FileVideo,
  X,
  Tag,
  Folder
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { publishVideo } from "../services/video.service.js";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Tech",
  "Education",
  "Entertainment",
  "News",
  "Sports",
  "Vlogs",
];

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = (setter) => (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) setter(file);
};

const UploadVideo = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const thumbnailRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "All",
    tags: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (file) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else if (file) {
      toast.error("Please upload a valid video file");
    }
  };

  const handleThumbnailChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      thumbnailRef.current = file;
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (file) {
      toast.error("Please upload a valid image file");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Video title is required");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Video description is required");
      return;
    }

    if (!videoFile || !thumbnailRef.current) {
      toast.error("Both video file and thumbnail image are required");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("category", form.category);
      if (form.tags.trim()) {
        payload.append("tags", form.tags.trim());
      }
      payload.append("videoFile", videoFile);
      payload.append("thumbnail", thumbnailRef.current);

      await publishVideo(payload);
      toast.success("Video uploaded and published successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft)">
            <Upload size={20} className="text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Upload Video</h1>
            <p className="text-sm text-(--muted)">
              Share your content with the world
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 sm:p-8 shadow-(--shadow-sm)">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="video-title"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)"
              >
                Title <span className="text-(--accent)">*</span>
              </label>
              <input
                id="video-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Give your video a catchy title"
                className="w-full rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="video-description"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)"
              >
                Description <span className="text-(--accent)">*</span>
              </label>
              <textarea
                id="video-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Tell viewers what your video is about..."
                className="w-full resize-none rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>

            {/* Category & Tags Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="video-category"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-(--muted)"
                >
                  <Folder size={13} className="text-(--accent)" />
                  Category
                </label>
                <select
                  id="video-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 focus:border-(--accent)"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="video-tags"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-(--muted)"
                >
                  <Tag size={13} className="text-(--accent)" />
                  Tags (comma separated)
                </label>
                <input
                  id="video-tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      tags: e.target.value,
                    }))
                  }
                  placeholder="tutorial, coding, react"
                  className="w-full rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent)"
                />
              </div>
            </div>

            {/* Video File Drop Zone */}
            <div>
              <label
                htmlFor="video-file-input"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)"
              >
                Video File <span className="text-(--accent)">*</span>
              </label>
              <div
                onClick={() => videoInputRef.current?.click()}
                onDrop={handleDrop(handleVideoChange)}
                onDragOver={handleDragOver}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--border) bg-(--surface-2) p-7 transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-3)"
              >
                {videoFile ? (
                  <div className="flex items-center gap-3">
                    <FileVideo
                      size={28}
                      className="text-(--accent)"
                    />
                    <div>
                      <p className="text-sm font-medium text-(--text)">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoFile(null);
                      }}
                      aria-label="Remove selected video"
                      className="rounded-lg p-1.5 text-(--muted) hover:bg-(--surface-3) hover:text-(--text)"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Film
                      size={36}
                      className="mb-2 text-(--muted-strong) transition-colors group-hover:text-(--text)"
                    />
                    <span className="text-sm font-medium text-(--text)">
                      Click or drag & drop video file
                    </span>
                    <span className="mt-1 text-xs text-(--muted)">
                      MP4, WEBM, MOV up to 100MB
                    </span>
                  </>
                )}

                <input
                  id="video-file-input"
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    handleVideoChange(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </div>
            </div>

            {/* Thumbnail Drop Zone */}
            <div>
              <label
                htmlFor="thumbnail-file-input"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-(--muted)"
              >
                Thumbnail Image <span className="text-(--accent)">*</span>
              </label>
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                onDrop={handleDrop(handleThumbnailChange)}
                onDragOver={handleDragOver}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--border) bg-(--surface-2) p-7 transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-3)"
              >
                {thumbnailPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-auto rounded-xl object-cover shadow-lg"
                    />
                    <span className="text-xs text-(--muted)">
                      Click or drag to change thumbnail
                    </span>
                  </div>
                ) : (
                  <>
                    <ImagePlus
                      size={36}
                      className="mb-2 text-(--muted-strong) transition-colors group-hover:text-(--text)"
                    />
                    <span className="text-sm font-medium text-(--text)">
                      Click or drag & drop thumbnail image
                    </span>
                    <span className="mt-1 text-xs text-(--muted)">
                      PNG, JPG, WebP (1280×720 recommended)
                    </span>
                  </>
                )}

                <input
                  id="thumbnail-file-input"
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleThumbnailChange(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload progress indicator */}
            {loading && (
              <div className="overflow-hidden rounded-full bg-(--surface-2)">
                <div className="h-1.5 w-full animate-pulse rounded-full bg-(--accent)" />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--accent) py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50 cursor-pointer shadow-lg shadow-(--accent-soft)"
            >
              {loading ? (
                <>
                  <Spinner size={16} />
                  <span>Uploading video...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Publish Video</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideo;
