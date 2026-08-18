import { useState, useRef, useEffect } from "react";
import { Settings, ChevronRight, ChevronLeft, Check, Repeat } from "lucide-react";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const formatSpeedLabel = (speed) => {
  return speed === 1 ? "Normal" : `${speed}x`;
};

const SettingsMenu = ({
  playbackSpeed = 1,
  onSpeedChange,
  isLooping = false,
  onToggleLoop,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("main"); // "main" | "speed"
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setCurrentView("main");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      {/* Settings Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setCurrentView("main");
        }}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer ${
          isOpen ? "bg-white/15 text-white rotate-45" : "text-white/90"
        }`}
        title="Settings"
        aria-label="Settings"
      >
        <Settings size={19} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-12 z-40 w-56 overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-1.5 shadow-2xl backdrop-blur-md text-xs text-white">
          {currentView === "main" ? (
            <div className="space-y-0.5">
              {/* Playback Speed Item */}
              <button
                type="button"
                onClick={() => setCurrentView("speed")}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/15 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-medium">Playback speed</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <span>{formatSpeedLabel(playbackSpeed)}</span>
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Loop Video Item */}
              <button
                type="button"
                onClick={onToggleLoop}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/15 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat size={14} className={isLooping ? "text-(--accent)" : "text-white/70"} />
                  <span className="font-medium">Loop video</span>
                </div>
                <div
                  className={`relative h-4 w-7 rounded-full transition-colors ${
                    isLooping ? "bg-(--accent)" : "bg-white/30"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
                      isLooping ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            </div>
          ) : (
            /* Speed Submenu */
            <div className="space-y-0.5">
              {/* Submenu Header */}
              <button
                type="button"
                onClick={() => setCurrentView("main")}
                className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-left font-medium hover:bg-white/10 rounded-t-xl transition-colors cursor-pointer text-white/80"
              >
                <ChevronLeft size={14} />
                <span>Playback speed</span>
              </button>

              {/* Speed List */}
              <div className="max-h-56 overflow-y-auto py-1">
                {SPEED_OPTIONS.map((speed) => {
                  const isSelected = playbackSpeed === speed;
                  return (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => {
                        onSpeedChange(speed);
                        setIsOpen(false);
                        setCurrentView("main");
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-white/15 transition-colors cursor-pointer text-left"
                    >
                      <span className={isSelected ? "font-semibold text-(--accent)" : ""}>
                        {formatSpeedLabel(speed)}
                      </span>
                      {isSelected && <Check size={14} className="text-(--accent)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
