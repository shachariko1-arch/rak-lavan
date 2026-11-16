"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "gold" | "outline" | "soft" | "ghost" | "danger" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-ivory shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_8px_20px_-10px_rgb(21_18_15/0.6)] hover:bg-ink-soft active:translate-y-px",
  gold:
    "text-ink bg-[linear-gradient(110deg,#c9a868_0%,#ecd9a8_38%,#c9a868_62%,#e6cf99_100%)] bg-[length:220%_100%] bg-[position:0%_0] hover:bg-[position:100%_0] shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_10px_28px_-12px_rgb(134_104_58/0.9)] active:translate-y-px",
  outline: "border border-ink/15 bg-white/60 text-ink hover:border-ink/35 hover:bg-white active:translate-y-px",
  soft: "bg-cream text-ink hover:bg-champagne/70 active:translate-y-px",
  ghost: "text-ink-soft hover:bg-ink/5",
  danger: "bg-declined text-white hover:bg-declined-ink active:translate-y-px",
  light: "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 active:translate-y-px",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-[13px]",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-[3.25rem] gap-2.5 px-7 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium tracking-[0.01em]",
    "transition-[background-color,background-position,border-color,color,transform,box-shadow,opacity] duration-300 ease-luxe",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, iconEnd, className, children, disabled, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : icon}
      {children}
      {iconEnd}
    </button>
  );
});

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
}

export function ButtonLink({ variant = "primary", size = "md", icon, iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "default" | "danger" | "light";
  size?: "sm" | "md";
}

/** Square, icon-only control. `label` is required: it is the accessible name and the tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, tone = "default", size = "md", className, children, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "size-8" : "size-10",
        tone === "default" && "text-stone hover:bg-ink/6 hover:text-ink",
        tone === "danger" && "text-stone hover:bg-declined-soft hover:text-declined",
        tone === "light" && "text-white/80 hover:bg-white/15 hover:text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
