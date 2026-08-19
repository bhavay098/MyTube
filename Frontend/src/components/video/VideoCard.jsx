import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { Play } from "lucide-react";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}:${String(remainMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const VideoCard = ({ video }) => {
  const duration = formatDuration(video?.duration);
  const timeAgo = video?.createdAt ? format(video.createdAt) : "";

  return (
    <Link
      to={`/video/${video?._id}`}
      className="group block cursor-pointer overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow-sm) transition-transform transition-colors duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:shadow-(--shadow)"
    >
      <div className="relative aspect-video overflow-hidden rounded-[1.1rem] bg-(--surface-2)">
        <img
          src={video?.thumbnail}
          alt={video?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-transform transition-opacity duration-300 group-hover:scale-100 group-hover:opacity-100">
            <Play size={20} className="ml-0.5 text-black" fill="black" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {duration}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex gap-3">
        <img
          src={video?.owner?.avatar}
          alt={video?.owner?.username}
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border border-(--border) object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm sm:text-[15px] font-medium leading-snug tracking-tight text-(--text)">
            {video?.title}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-(--muted) transition-colors group-hover:text-(--text)">
            {video?.owner?.fullName}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-(--muted-strong)">
            <span>{video?.views ?? 0} views</span>
            {timeAgo && (
              <>
                <span>•</span>
                <span>{timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
