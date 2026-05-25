import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  return (
    <Link
      to={`/video/${video?._id}`}
      className="group block cursor-pointer overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow) transition-all duration-300 hover:-translate-y-1 hover:border-(--accent)"
    >
      <div className="aspect-video overflow-hidden rounded-[1.1rem] bg-(--surface-2)">
        <img
          src={video?.thumbnail}
          alt={video?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <img
          src={video?.owner?.avatar}
          alt={video?.owner?.username}
          className="h-10 w-10 shrink-0 rounded-full border border-(--border) object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 tracking-tight text-(--text)">
            {video?.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-(--muted)">
            {video?.owner?.fullName}
          </p>

          <div className="mt-1 flex items-center gap-2 text-sm text-(--muted-strong)">
            <span>{video?.views} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
