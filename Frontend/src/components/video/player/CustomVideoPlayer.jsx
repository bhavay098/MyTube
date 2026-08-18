import { useState, useRef, useEffect, useCallback } from "react";
import PlayerControlBar from "./PlayerControlBar.jsx";
import CenterOverlayAnimation from "./CenterOverlayAnimation.jsx";
import { useVideoShortcuts } from "./useVideoShortcuts.js";

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
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const clickTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isAutoplayNext, setIsAutoplayNext] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isEnded, setIsEnded] = useState(false);

  const isPiPSupported = typeof document !== "undefined" && document.pictureInPictureEnabled;

  const triggerFeedback = useCallback((type, text) => {
    setFeedback({ type, text, key: Date.now() });
    setTimeout(() => {
      setFeedback((curr) => (curr?.type === type ? null : curr));
    }, 650);
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
      triggerFeedback("play");
    } else {
      videoRef.current.pause();
      triggerFeedback("pause");
    }
  }, [triggerFeedback]);

  const seekRelative = useCallback(
    (seconds) => {
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      triggerFeedback(seconds < 0 ? "rewind" : "forward");
      resetHideTimer();
    },
    [duration, triggerFeedback, resetHideTimer]
  );

  const seekToPercent = useCallback(
    (percent) => {
      if (!videoRef.current || !duration) return;
      const newTime = (percent / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      resetHideTimer();
    },
    [duration, resetHideTimer]
  );

  const handleSeek = useCallback((time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((newVolume) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    if (clamped > 0 && videoRef.current.muted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    triggerFeedback(nextMuted ? "mute" : "volume", `${Math.round(volume * 100)}%`);
  }, [triggerFeedback, volume]);

  const adjustVolume = useCallback(
    (delta) => {
      if (!videoRef.current) return;
      const next = Math.max(0, Math.min(1, (isMuted ? 0 : volume) + delta));
      handleVolumeChange(next);
      triggerFeedback("volume", `${Math.round(next * 100)}%`);
      resetHideTimer();
    },
    [volume, isMuted, handleVolumeChange, triggerFeedback, resetHideTimer]
  );

  const handleSpeedChange = useCallback((speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  const changeSpeedStep = useCallback(
    (direction) => {
      const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const currentIndex = speeds.indexOf(playbackSpeed);
      const targetIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + direction));
      handleSpeedChange(speeds[targetIndex]);
    },
    [playbackSpeed, handleSpeedChange]
  );

  const toggleLoop = useCallback(() => {
    if (!videoRef.current) return;
    const nextLoop = !isLooping;
    videoRef.current.loop = nextLoop;
    setIsLooping(nextLoop);
  }, [isLooping]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current || !isPiPSupported) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // Ignored if user declined or browser blocked
    }
  }, [isPiPSupported]);

  // Handle click & double-click gestures on video canvas
  const handleSurfaceClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;

      // Double-click detected
      if (clickX < width * 0.35) {
        seekRelative(-10);
      } else if (clickX > width * 0.65) {
        seekRelative(10);
      } else {
        toggleFullscreen();
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        togglePlay();
      }, 220);
    }
  };

  // Video element events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleProgress = () => {
    if (!videoRef.current) return;
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      setBufferedEnd(buffered.end(buffered.length - 1));
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
    if (!isLooping && isAutoplayNext && hasNextVideo && onNextVideo) {
      onNextVideo();
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts hook
  useVideoShortcuts({
    playerRef: containerRef,
    videoRef,
    togglePlay,
    seekRelative,
    seekToPercent,
    adjustVolume,
    toggleMute,
    toggleFullscreen,
    toggleTheaterMode: onToggleTheater,
    togglePiP,
    changeSpeedStep,
    enabled: true,
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
        onClick={handleSurfaceClick}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration || 0);
          setIsPlaying(!e.target.paused);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setIsEnded(false);
          resetHideTimer();
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={handleEnded}
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
