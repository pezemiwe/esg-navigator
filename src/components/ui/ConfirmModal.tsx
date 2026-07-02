import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-white shadow-xl border border-[#e0e0e0]"
      >
        <div className="flex items-start gap-4 p-6">
          <div className={`shrink-0 flex items-center justify-center h-10 w-10 ${variant === "danger" ? "bg-red-50" : "bg-amber-50"}`}>
            <AlertTriangle className={`h-5 w-5 ${variant === "danger" ? "text-red-500" : "text-amber-500"}`} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#161616] mb-1">{title}</h3>
            <p className="text-[13px] text-[#525252] leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-semibold text-[#161616] border border-[#e0e0e0] hover:border-[#86bc25] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-semibold text-white transition-colors ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#161616] hover:bg-[#86bc25]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
