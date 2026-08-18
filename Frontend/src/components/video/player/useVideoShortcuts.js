import { useEffect } from "react";

export const useVideoShortcuts = ({
  playerRef,
  videoRef,
  togglePlay,
  seekRelative,
  seekToPercent,
  adjustVolume,
  toggleMute,
  toggleFullscreen,
  toggleTheaterMode,
  togglePiP,
  changeSpeedStep,
  enabled = true,
}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore shortcut keys if user is typing in form inputs, textareas, contentEditables or modals
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isEditable =
        document.activeElement?.isContentEditable ||
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select";

      if (isEditable) return;

      const key = e.key;

      switch (key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;

        case "j":
        case "J":
          e.preventDefault();
          seekRelative(-10);
          break;

        case "l":
        case "L":
          e.preventDefault();
          seekRelative(10);
          break;

        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-5);
          break;

        case "ArrowRight":
          e.preventDefault();
          seekRelative(5);
          break;

        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.05);
          break;

        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.05);
          break;

        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;

        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;

        case "t":
        case "T":
          e.preventDefault();
          if (toggleTheaterMode) toggleTheaterMode();
          break;

        case "i":
        case "I":
          e.preventDefault();
          if (togglePiP) togglePiP();
          break;

        case ">":
        case ".":
          if (e.shiftKey || key === ">") {
            e.preventDefault();
            changeSpeedStep(1);
          }
          break;

        case "<":
        case ",":
          if (e.shiftKey || key === "<") {
            e.preventDefault();
            changeSpeedStep(-1);
          }
          break;

        default:
          // Numeric keys 0-9 for seeking percentage
          if (key >= "0" && key <= "9") {
            e.preventDefault();
            const percent = parseInt(key, 10) * 10;
            seekToPercent(percent);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    togglePlay,
    seekRelative,
    seekToPercent,
    adjustVolume,
    toggleMute,
    toggleFullscreen,
    toggleTheaterMode,
    togglePiP,
    changeSpeedStep,
  ]);
};
