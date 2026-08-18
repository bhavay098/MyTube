import { Volume2, Volume1, VolumeX } from "lucide-react";

const VolumeControl = ({
  volume = 1,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
}) => {
  const currentVolume = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (isMuted || currentVolume === 0) {
      return <VolumeX size={20} className="text-white" />;
    }
    if (currentVolume < 0.5) {
      return <Volume1 size={20} className="text-white" />;
    }
    return <Volume2 size={20} className="text-white" />;
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div className="group/volume relative flex items-center gap-1.5">
      {/* Mute/Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus:outline-none"
        title={isMuted ? "Unmute (m)" : "Mute (m)"}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {getVolumeIcon()}
      </button>

      {/* Slide-out Volume Slider */}
      <div className="flex w-0 items-center overflow-hidden transition-[width] duration-200 ease-out group-hover/volume:w-20 group-focus-within/volume:w-20">
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={currentVolume}
          onChange={handleSliderChange}
          className="h-1 w-18 cursor-pointer accent-(--accent) focus:outline-none"
          aria-label="Volume slider"
        />
      </div>
    </div>
  );
};

export default VolumeControl;
