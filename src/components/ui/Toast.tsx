import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}
interface ToastStore {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearAll: () => set({ toasts: [] }),
}));
type ToastOpts = { title?: string; duration?: number };

export const toast = {
  success: (message: string, opts?: ToastOpts) =>
    useToastStore.getState().addToast({ type: "success", message, ...opts }),
  error: (message: string, opts?: ToastOpts) =>
    useToastStore.getState().addToast({ type: "error", message, ...opts }),
  warning: (message: string, opts?: ToastOpts) =>
    useToastStore.getState().addToast({ type: "warning", message, ...opts }),
  info: (message: string, opts?: ToastOpts) =>
    useToastStore.getState().addToast({ type: "info", message, ...opts }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
  clearAll: () => useToastStore.getState().clearAll(),
};
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const typeStyles: Record<ToastType, string> = {
  success: "border-l-success-500 [&_.toast-icon]:text-success-500",
  error: "border-l-error-500 [&_.toast-icon]:text-error-500",
  warning: "border-l-warning-500 [&_.toast-icon]:text-warning-500",
  info: "border-l-info-500 [&_.toast-icon]:text-info-500",
};

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};
function ToastNotification({
  data,
  onDismiss,
}: {
  data: ToastData;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const duration = data.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(data.id), duration);
      return () => clearTimeout(timer);
    }
  }, [data.id, data.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-3 w-80 rounded-lg border-l-4 p-4 shadow-lg",
        "bg-white dark:bg-secondary-800",
        "animate-slide-in-right",
        typeStyles[data.type],
      )}
    >
      <span className="toast-icon shrink-0 mt-0.5">{icons[data.type]}</span>
      <div className="flex-1 min-w-0">
        {data.title && (
          <p className="text-sm font-semibold text-neutral-900">{data.title}</p>
        )}
        <p className="text-sm text-neutral-600">{data.message}</p>
        {data.action && (
          <button
            type="button"
            onClick={data.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
          >
            {data.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(data.id)}
        className="shrink-0 rounded p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
export interface ToasterProps {
  position?: ToastPosition;
  maxVisible?: number;
}

function Toaster({ position = "top-right", maxVisible = 5 }: ToasterProps) {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  const visibleToasts = toasts.slice(-maxVisible);

  if (visibleToasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-100 flex flex-col gap-2",
        positionStyles[position],
      )}
    >
      {visibleToasts.map((t) => (
        <ToastNotification key={t.id} data={t} onDismiss={removeToast} />
      ))}
    </div>,
    document.body,
  );
}

export { Toaster };
