import {
  VideoOff,
  Heart,
  History,
  FolderOpen,
  Users,
  MessageSquareText,
  Search,
} from "lucide-react";

const iconMap = {
  video: VideoOff,
  heart: Heart,
  history: History,
  folder: FolderOpen,
  users: Users,
  tweet: MessageSquareText,
  search: Search,
};

const EmptyState = ({
  icon = "video",
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
}) => {
  const Icon = iconMap[icon] || VideoOff;

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-(--surface-2) text-(--muted-strong)">
        <Icon size={36} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-(--text)">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-(--muted)">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 rounded-full bg-(--accent) px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
