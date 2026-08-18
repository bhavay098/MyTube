import { AlertTriangle } from "lucide-react";
import Modal from "./Modal.jsx";
import Spinner from "./Spinner.jsx";

const VARIANT_STYLES = {
  danger: "bg-(--error) text-white hover:opacity-90",
  primary: "bg-(--accent) text-white hover:bg-(--accent-strong)",
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            variant === "danger" ? "bg-(--error-soft) text-(--error)" : "bg-(--accent-soft) text-(--accent)"
          }`}
        >
          <AlertTriangle size={24} />
        </div>

        <p className="text-sm text-(--muted)">{description}</p>

        <div className="mt-6 flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-(--border) bg-(--surface-2) px-4 py-2.5 text-sm font-medium text-(--text) transition-colors duration-200 hover:bg-(--surface-3) disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 ${
              VARIANT_STYLES[variant] || VARIANT_STYLES.danger
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={16} />
                <span>Processing...</span>
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
