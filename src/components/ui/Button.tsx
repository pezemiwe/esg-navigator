import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-500",
  outline:
    "border border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-500/10 dark:active:bg-primary-500/20",
  ghost:
    "text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-500/10",
  danger:
    "bg-error-500 text-white shadow-sm hover:bg-error-700 focus-visible:ring-error-500",
  link: "text-primary-600 bg-transparent underline-offset-4 hover:underline focus-visible:ring-primary-500 dark:text-primary-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 text-xs px-2.5 rounded [&_svg]:h-3 [&_svg]:w-3",
  sm: "h-8 text-sm px-3 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "h-9 text-sm px-4 rounded-lg [&_svg]:h-4 [&_svg]:w-4",
  lg: "h-11 text-base px-6 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 w-7 rounded [&_svg]:h-3 [&_svg]:w-3",
  sm: "h-8 w-8 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "h-9 w-9 rounded-lg [&_svg]:h-4 [&_svg]:w-4",
  lg: "h-11 w-11 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isIconOnly = !children && (leftIcon || rightIcon);

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition-colors duration-150 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          isIconOnly
            ? iconOnlySizeStyles[size]
            : variant === "link"
              ? "text-sm"
              : sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
