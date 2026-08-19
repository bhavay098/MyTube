import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize,
  Minimize,
  Tv,
  PictureInPicture2,
} from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";
import SettingsMenu from "./SettingsMenu.jsx";

const formatTime = (seconds, totalDuration = 0) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const showHours = totalDuration >= 3600 || hrs > 0;

  if (showHours) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const PlayerControlBar = ({
  player,
  isVisible,
  hasNextVideo = false,
  onNextVideo,
  nextVideoTitle = "",
  isTheaterMode = false,
  onToggleTheater,
}) => {
  const {
    isPlaying = false,
    isEnded = false,
    togglePlay: onTogglePlay,
    volume = 1,
    isMuted = false,
    handleVolumeChange: onVolumeChange,
    toggleMute: onToggleMute,
    currentTime = 0,
    duration = 0,
    bufferedEnd = 0,
    handleSeek: onSeek,
    isAutoplayNext = false,
    setIsAutoplayNext,
    playbackSpeed = 1,
    handleSpeedChange: onSpeedChange,
    isLooping = false,
    toggleLoop: onToggleLoop,
    isPiPSupported = false,
    togglePiP: onTogglePiP,
    isFullscreen = false,
    toggleFullscreen: onToggleFullscreen,
  } = player || {};

  const onToggleAutoplayNext = () => setIsAutoplayNext?.((prev) => !prev);
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300 ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Scrubber Progress Bar */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        bufferedEnd={bufferedEnd}
        onSeek={onSeek}
      />

      {/* Control Buttons Row */}
      <div className="mt-1 flex items-center justify-between text-white select-none">
        {/* Left Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Play / Pause / Replay */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            title={isEnded ? "Replay (k)" : isPlaying ? "Pause (k)" : "Play (k)"}
            aria-label={isEnded ? "Replay" : isPlaying ? "Pause" : "Play"}
          >
            {isEnded ? (
              <RotateCcw size={20} />
            ) : isPlaying ? (
              <Pause size={20} className="fill-white" />
            ) : (
              <Play size={20} className="fill-white translate-x-0.5" />
            )}
          </button>

          {/* Next Video Button */}
          {hasNextVideo && (
            <button
              type="button"
              onClick={onNextVideo}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              title={nextVideoTitle ? `Next: ${nextVideoTitle}` : "Next video (Shift+N)"}
              aria-label="Next video"
            >
              <SkipForward size={18} />
            </button>
          )}

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />

          {/* Time Display */}
          <div className="ml-1 text-[11px] sm:text-xs font-medium text-white/90">
            <span>{formatTime(currentTime, duration)}</span>
            <span className="mx-1 text-white/50">/</span>
            <span>{formatTime(duration, duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Autoplay Next Switch */}
          {hasNextVideo && (
            <button
              type="button"
              onClick={onToggleAutoplayNext}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
              title={`Autoplay is ${isAutoplayNext ? "on" : "off"}`}
            >
              <span className="hidden md:inline text-[11px] font-medium">Autoplay</span>
              <div
                className={`relative h-3.5 w-6 rounded-full transition-colors ${
                  isAutoplayNext ? "bg-(--accent)" : "bg-white/30"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform ${
                    isAutoplayNext ? "translate-x-3" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          )}

          {/* Settings Menu */}
          <SettingsMenu
            playbackSpeed={playbackSpeed}
            onSpeedChange={onSpeedChange}
            isLooping={isLooping}
            onToggleLoop={onToggleLoop}
          />

          {/* Picture-in-Picture */}
          {isPiPSupported && (
            <button
              type="button"
              onClick={onTogglePiP}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              title="Miniplayer (i)"
              aria-label="Miniplayer"
            >
              <PictureInPicture2 size={18} />
            </button>
          )}

          {/* Theater Mode */}
          {onToggleTheater && (
            <button
              type="button"
              onClick={onToggleTheater}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              title={isTheaterMode ? "Default view (t)" : "Theater mode (t)"}
              aria-label="Theater mode"
            >
              <Tv size={18} className={isTheaterMode ? "text-(--accent)" : ""} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            title={isFullscreen ? "Exit full screen (f)" : "Full screen (f)"}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControlBar;
