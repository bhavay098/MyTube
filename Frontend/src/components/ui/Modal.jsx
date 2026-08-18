import { useEffect, useEffectEvent, useRef } from "react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  const onBackdropClick = useEffectEvent((e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      onClose();
    }
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    dialog.addEventListener("click", onBackdropClick);
    return () => dialog.removeEventListener("click", onBackdropClick);
  }, [open]);


  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`animate-fade-in-scale fixed inset-0 m-auto w-full ${maxWidth} rounded-2xl border border-(--border) bg-(--surface) p-6 text-(--text) shadow-2xl backdrop:bg-(--overlay) backdrop:animate-[overlayFadeIn_0.2s_ease-out]`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-(--text)">{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-2) text-(--muted) transition-colors duration-200 hover:bg-(--surface-3) hover:text-(--text)"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {children}
    </dialog>
  );
};

export default Modal;

