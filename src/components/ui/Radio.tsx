import React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex shrink-0 items-center justify-center pt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded-full border border-neutral-300 bg-transparent",
              "transition-colors duration-150",
              "checked:border-primary-500",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          <div className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-150" />
        </div>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={radioId}
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
Radio.displayName = "Radio";

export interface RadioGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

function RadioGroup({
  label,
  children,
  className,
  orientation = "vertical",
}: RadioGroupProps) {
  return (
    <fieldset
      className={cn("flex flex-col gap-1.5", className)}
      role="radiogroup"
    >
      {label && (
        <legend className="text-sm font-medium text-neutral-700 mb-1">
          {label}
        </legend>
      )}
      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
      >
        {children}
      </div>
    </fieldset>
  );
}

export { Radio, RadioGroup };
