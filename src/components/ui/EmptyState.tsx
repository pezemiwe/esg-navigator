import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-neutral-100 dark:bg-secondary-700",
          compact ? "h-12 w-12 mb-3" : "h-16 w-16 mb-4",
        )}
      >
        {icon || (
          <Inbox
            className={cn("text-neutral-400", compact ? "h-6 w-6" : "h-8 w-8")}
          />
        )}
      </div>
      <h3
        className={cn(
          "font-semibold text-neutral-900",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1 text-neutral-500 max-w-sm",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
