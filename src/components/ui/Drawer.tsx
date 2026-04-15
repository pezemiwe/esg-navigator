import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawerPosition = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
  className?: string;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  title?: string;
}

const horizontalSizes: Record<DrawerSize, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

const verticalSizes: Record<DrawerSize, string> = {
  sm: "max-h-[25vh]",
  md: "max-h-[50vh]",
  lg: "max-h-[75vh]",
  xl: "max-h-[90vh]",
};

const positionStyles: Record<DrawerPosition, string> = {
  left: "inset-y-0 left-0",
  right: "inset-y-0 right-0",
  top: "inset-x-0 top-0",
  bottom: "inset-x-0 bottom-0",
};

const slideAnimations: Record<DrawerPosition, string> = {
  left: "animate-slide-in-left",
  right: "animate-slide-in-right",
  top: "animate-slide-in-up",
  bottom: "animate-slide-in-down",
};

function Drawer({
  open,
  onClose,
  children,
  position = "right",
  size = "md",
  className,
  closeOnOverlay = true,
  closeOnEscape = true,
  title,
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) onClose();
    },
    [onClose, closeOnEscape],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  const isHorizontal = position === "left" || position === "right";

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed bg-white dark:bg-secondary-800 shadow-xl flex flex-col",
          positionStyles[position],
          slideAnimations[position],
          isHorizontal
            ? cn("w-full h-full", horizontalSizes[size])
            : cn("w-full h-full", verticalSizes[size]),
          className,
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900">
            {title || "\u00A0"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export { Drawer };
