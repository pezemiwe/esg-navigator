import React from "react";
import { cn } from "@/lib/utils";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: string;
  description?: string;
  switchSize?: SwitchSize;
}

const trackSizes: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
  lg: "h-6 w-11",
};

const thumbSizes: Record<SwitchSize, string> = {
  sm: "h-3 w-3 peer-checked:translate-x-3",
  md: "h-4 w-4 peer-checked:translate-x-4",
  lg: "h-5 w-5 peer-checked:translate-x-5",
};

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, switchSize = "md", id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            className={cn("peer sr-only", className)}
            {...props}
          />
          <div
            className={cn(
              "rounded-full bg-neutral-300 transition-colors duration-200",
              "peer-checked:bg-primary-500",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              trackSizes[switchSize],
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
              thumbSizes[switchSize],
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-neutral-900"
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-xs text-neutral-500">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
