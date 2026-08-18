import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-(--overlay) animate-[overlayFadeIn_0.2s_ease-out]"
        aria-label="Close modal"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-fade-in-scale relative w-full ${maxWidth} rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-2xl`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--text)">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-2) text-(--muted) transition-all duration-200 hover:bg-(--surface-3) hover:text-(--text)"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
