import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "plain";

export const buttonBaseClasses =
  "inline-flex h-[3.75rem] items-center justify-center rounded-full border-[2.25px] border-[rgba(120,168,255,0.28)] bg-[rgba(10,28,62,0.6)] px-7 text-base font-semibold tracking-tight text-white transition-colors transition-transform transition-shadow duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(66,182,255,0.25)] active:translate-y-0 active:shadow-[0_0_18px_rgba(73,197,255,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:text-white disabled:bg-[rgba(10,28,62,0.4)] disabled:border-[rgba(120,168,255,0.18)]";

const sharedHover =
  "hover:bg-[#49c5ff] hover:text-slate-950 active:bg-[#34afea] active:text-slate-900";

const variantStyles: Record<ButtonVariant, string> = {
  primary: sharedHover,
  secondary: sharedHover,
  ghost: sharedHover,
  plain: sharedHover,
};

export const buttonClassName = (variant: ButtonVariant = "primary") =>
  cn(buttonBaseClasses, variantStyles[variant]);
