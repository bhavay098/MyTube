import PlayerControlBar from "./PlayerControlBar.jsx";
import CenterOverlayAnimation from "./CenterOverlayAnimation.jsx";
import { useVideoPlayer } from "./useVideoPlayer.js";

const CustomVideoPlayer = ({
  src,
  poster,
  hasNextVideo = false,
  onNextVideo,
  nextVideoTitle = "",
  isTheaterMode = false,
  onToggleTheater,
  autoPlay = true,
}) => {
  const player = useVideoPlayer({
    hasNextVideo,
    onNextVideo,
    onToggleTheater,
  });

  const {
    containerRef,
    videoRef,
    isPlaying,
    isBuffering,
    showControls,
    setShowControls,
    isFullscreen,
    feedback,
    resetHideTimer,
    videoProps,
  } = player;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group/player relative aspect-video w-full overflow-hidden bg-black select-none ${
        isFullscreen ? "h-screen w-screen rounded-none" : "rounded-3xl border border-(--border)"
      } ${isPlaying && !showControls ? "cursor-none" : "cursor-default"}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        {...videoProps}
        className="h-full w-full object-contain"
      />

      {/* Center Action Overlay & Buffering */}
      <CenterOverlayAnimation isBuffering={isBuffering} feedback={feedback} />

      {/* Control Bar Overlay */}
      <PlayerControlBar
        player={player}
        isVisible={showControls || !isPlaying}
        hasNextVideo={hasNextVideo}
        onNextVideo={onNextVideo}
        nextVideoTitle={nextVideoTitle}
        isTheaterMode={isTheaterMode}
        onToggleTheater={onToggleTheater}
      />
    </div>
  );
};

export default CustomVideoPlayer;
