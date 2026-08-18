import PlayerControlBar from "./PlayerControlBar.jsx";
import CenterOverlayAnimation from "./CenterOverlayAnimation.jsx";
import { useVideoPlayer } from "./useVideoPlayer.js";

const CustomVideoPlayer = ({
  src,
  poster,
  title,
  hasNextVideo = false,
  onNextVideo,
  nextVideoTitle = "",
  isTheaterMode = false,
  onToggleTheater,
  autoPlay = true,
}) => {
  const {
    containerRef,
    videoRef,
    isPlaying,
    currentTime,
    duration,
    bufferedEnd,
    volume,
    isMuted,
    playbackSpeed,
    isLooping,
    isAutoplayNext,
    setIsAutoplayNext,
    isBuffering,
    showControls,
    setShowControls,
    isFullscreen,
    feedback,
    isEnded,
    isPiPSupported,
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    handleSpeedChange,
    toggleLoop,
    toggleFullscreen,
    togglePiP,
    resetHideTimer,
    videoProps,
  } = useVideoPlayer({
    hasNextVideo,
    onNextVideo,
    onToggleTheater,
  });

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
        isPlaying={isPlaying}
        isEnded={isEnded}
        onTogglePlay={togglePlay}
        hasNextVideo={hasNextVideo}
        onNextVideo={onNextVideo}
        nextVideoTitle={nextVideoTitle}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        currentTime={currentTime}
        duration={duration}
        bufferedEnd={bufferedEnd}
        onSeek={handleSeek}
        isAutoplayNext={isAutoplayNext}
        onToggleAutoplayNext={() => setIsAutoplayNext((prev) => !prev)}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        isLooping={isLooping}
        onToggleLoop={toggleLoop}
        isPiPSupported={isPiPSupported}
        onTogglePiP={togglePiP}
        isTheaterMode={isTheaterMode}
        onToggleTheater={onToggleTheater}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isVisible={showControls || !isPlaying}
      />
    </div>
  );
};

export default CustomVideoPlayer;
