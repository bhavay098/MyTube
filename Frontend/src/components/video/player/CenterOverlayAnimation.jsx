import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Loader2 } from "lucide-react";

const CenterOverlayAnimation = ({ isBuffering, feedback }) => {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-20">
      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 shadow-xl backdrop-blur-sm">
          <Loader2 className="h-9 w-9 animate-spin text-(--accent)" />
        </div>
      )}

      {/* Ripple / Action Feedback Overlay */}
      {feedback && !isBuffering && (
        <div
          key={feedback.key}
          className={`animate-pop-feedback flex items-center justify-center rounded-full bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md ${
            feedback.type === "rewind"
              ? "absolute left-16"
              : feedback.type === "forward"
              ? "absolute right-16"
              : ""
          }`}
        >
          {feedback.type === "play" && <Play size={32} className="fill-white translate-x-0.5" />}
          {feedback.type === "pause" && <Pause size={32} className="fill-white" />}
          {feedback.type === "forward" && (
            <div className="flex flex-col items-center">
              <RotateCw size={28} />
              <span className="mt-1 text-[11px] font-bold">+10s</span>
            </div>
          )}
          {feedback.type === "rewind" && (
            <div className="flex flex-col items-center">
              <RotateCcw size={28} />
              <span className="mt-1 text-[11px] font-bold">-10s</span>
            </div>
          )}
          {feedback.type === "volume" && (
            <div className="flex items-center gap-1">
              <Volume2 size={24} />
              <span className="text-xs font-bold">{feedback.text}</span>
            </div>
          )}
          {feedback.type === "mute" && <VolumeX size={28} />}
        </div>
      )}
    </div>
  );
};

export default CenterOverlayAnimation;
