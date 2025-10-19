import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "plain";

export const buttonBaseClasses =
  "inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold tracking-tight text-white transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:text-white disabled:bg-white/10 disabled:border-white/20";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "hover:bg-teal-400 hover:text-slate-950",
  secondary: "hover:bg-white/20 hover:text-white",
  ghost: "hover:bg-white/15 hover:text-white",
  plain: "hover:bg-transparent hover:text-teal-200",
};

export const buttonClassName = (variant: ButtonVariant = "primary") =>
  cn(buttonBaseClasses, variantStyles[variant]);
