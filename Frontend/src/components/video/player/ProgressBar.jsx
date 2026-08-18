import { useState, useRef, useEffect, useCallback } from "react";

const formatTimeTooltip = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const ProgressBar = ({
  currentTime = 0,
  duration = 0,
  bufferedEnd = 0,
  onSeek,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(null); // { xPercent, time, clientX }
  const barRef = useRef(null);

  const calculateTimeFromEvent = useCallback(
    (e) => {
      if (!barRef.current || !duration) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = offsetX / rect.width;
      return percentage * duration;
    },
    [duration]
  );

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const targetTime = calculateTimeFromEvent(e);
    setDragTime(targetTime);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!barRef.current || !duration) return;
      const rect = barRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
      const time = percentage * duration;

      setHoverPosition({
        xPercent: percentage * 100,
        time,
        clientX,
      });

      if (isDragging) {
        setDragTime(time);
      }
    },
    [calculateTimeFromEvent, duration, isDragging]
  );

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e) => {
      const time = calculateTimeFromEvent(e);
      setDragTime(time);
    };

    const handleWindowMouseUp = (e) => {
      setIsDragging(false);
      const finalTime = calculateTimeFromEvent(e);
      onSeek(finalTime);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging, calculateTimeFromEvent, onSeek]);

  const activeTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, (activeTime / duration) * 100) : 0;
  const bufferedPercent = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group/progress relative flex h-6 w-full cursor-pointer items-center select-none"
      role="slider"
      aria-label="Video scrubber"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(activeTime)}
      tabIndex={0}
    >
      {/* Tooltip on hover */}
      {hoverPosition && (
        <div
          className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm z-30"
          style={{ left: `${hoverPosition.xPercent}%` }}
        >
          {formatTimeTooltip(hoverPosition.time)}
        </div>
      )}

      {/* Progress Track Container */}
      <div className="relative h-1 w-full bg-white/20 transition-all duration-150 group-hover/progress:h-2">
        {/* Buffered portion */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/40 transition-all"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Hover ghost track */}
        {hoverPosition && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/30"
            style={{ width: `${hoverPosition.xPercent}%` }}
          />
        )}

        {/* Played portion (Accent red) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-(--accent)"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Scrubber thumb handle */}
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-(--accent) shadow-[0_0_8px_rgba(255,0,51,0.6)] transition-transform duration-150 ${
            isDragging ? "scale-125" : "scale-0 group-hover/progress:scale-100"
          }`}
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
