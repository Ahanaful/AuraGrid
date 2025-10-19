"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "plain";

type AuraButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500",
  secondary:
    "bg-teal-500 text-slate-950 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
  plain:
    "bg-transparent text-slate-500 hover:text-slate-900",
};

export const Button = forwardRef<HTMLButtonElement, AuraButtonProps>(
  ({ className, variant = "primary", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
          variantStyles[variant],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
