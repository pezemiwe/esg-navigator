import React, { useEffect, useRef } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, description, indeterminate = false, id, ...props },
    ref,
  ) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const internalRef = useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const Icon = indeterminate ? Minus : Check;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex shrink-0 items-center justify-center pt-0.5">
          <input
            ref={internalRef}
            type="checkbox"
            id={checkboxId}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border border-neutral-300 bg-transparent",
              "transition-colors duration-150",
              "checked:border-primary-500 checked:bg-primary-500",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              indeterminate && "border-primary-500 bg-primary-500",
              className,
            )}
            {...props}
          />
          <Icon
            className={cn(
              "pointer-events-none absolute h-3 w-3 text-white",
              indeterminate
                ? "opacity-100"
                : "opacity-0 peer-checked:opacity-100",
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
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
Checkbox.displayName = "Checkbox";

export { Checkbox };
