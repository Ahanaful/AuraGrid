"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { buttonClassName, ButtonVariant } from "@/lib/buttonStyles";

type AuraButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, AuraButtonProps>(
  ({ className, variant = "primary", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClassName(variant) + (className ? ` ${className}` : "")}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
