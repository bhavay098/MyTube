import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload,
  Film,
  ImagePlus,
  FileVideo,
  X,
} from "lucide-react";

import Layout from "../components/layout/Layout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { publishVideo } from "../services/video.service.js";

const UploadVideo = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (file) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (setter) => (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
      toast.success("Video uploaded successfully!");
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
            <h1 className="text-2xl font-bold text-(--text)">Upload Video</h1>
            <p className="text-sm text-(--muted)">
              Share your content with the world
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Title
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Give your video a catchy title"
                className="w-full rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Tell viewers about your video"
                className="w-full resize-none rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm text-(--text) outline-none transition-all duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>

            {/* Video File Drop Zone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Video File
              </label>
              <div
                onClick={() => videoInputRef.current?.click()}
                onDrop={handleDrop(handleVideoChange)}
                onDragOver={handleDragOver}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--surface-2) p-8 transition-all duration-200 hover:border-(--accent) hover:bg-(--accent-soft)"
              >
                {videoFile ? (
                  <div className="flex items-center gap-3">
                    <FileVideo
                      size={24}
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
                      className="rounded-lg p-1 text-(--muted) hover:bg-(--surface-3) hover:text-(--text)"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Film
                      size={32}
                      className="mb-2 text-(--muted-strong) transition-colors group-hover:text-(--accent)"
                    />
                    <span className="text-sm text-(--muted)">
                      Click or drag & drop your video
                    </span>
                    <span className="mt-1 text-xs text-(--muted-strong)">
                      MP4, MOV, AVI up to 500MB
                    </span>
                  </>
                )}

                <input
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
              <label className="mb-1.5 block text-sm font-medium text-(--muted)">
                Thumbnail
              </label>
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                onDrop={handleDrop(handleThumbnailChange)}
                onDragOver={handleDragOver}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--surface-2) p-8 transition-all duration-200 hover:border-(--accent) hover:bg-(--accent-soft)"
              >
                {thumbnailPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-28 w-auto rounded-lg object-cover shadow-md"
                    />
                    <span className="text-xs text-(--muted)">
                      Click or drag to change
                    </span>
                  </div>
                ) : (
                  <>
                    <ImagePlus
                      size={32}
                      className="mb-2 text-(--muted-strong) transition-colors group-hover:text-(--accent)"
                    />
                    <span className="text-sm text-(--muted)">
                      Click or drag & drop thumbnail
                    </span>
                    <span className="mt-1 text-xs text-(--muted-strong)">
                      PNG, JPG, WebP recommended 1280×720
                    </span>
                  </>
                )}

                <input
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--accent-strong) disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner size={16} />
                  <span>Uploading...</span>
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
