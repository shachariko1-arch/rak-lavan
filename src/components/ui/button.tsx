import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "champagne" | "ghost" | "outline" | "light" | "dark" | "app" | "app-outline" | "app-ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background,color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  champagne:
    "bg-champagne text-night shadow-[0_10px_30px_-12px_rgba(217,185,139,.55)] hover:bg-champagne-light hover:shadow-[0_16px_40px_-14px_rgba(217,185,139,.75)] hover:-translate-y-px",
  ghost: "text-pearl hover:bg-white/8",
  outline: "border border-white/20 text-pearl hover:border-white/45 hover:bg-white/[.04]",
  light: "bg-ivory text-night hover:bg-white hover:-translate-y-px",
  dark: "bg-night text-pearl hover:bg-elevated",
  app: "bg-ink text-white shadow-[0_8px_20px_-12px_rgba(21,21,21,.6)] hover:bg-black hover:-translate-y-px",
  "app-outline": "border border-hairline bg-card text-ink hover:border-ink/25 hover:shadow-[var(--shadow-soft)]",
  "app-ghost": "text-ink-2 hover:bg-black/[.04] hover:text-ink",
  danger: "bg-declined text-white hover:bg-declined-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[14px]",
  lg: "h-14 px-8 text-[15px] tracking-[0.01em]",
};

type CommonProps = { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode; iconEnd?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ComponentProps<"button"> & CommonProps>(function Button(
  { variant = "champagne", size = "md", loading, icon, iconEnd, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconEnd}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "champagne",
  size = "md",
  icon,
  iconEnd,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & CommonProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  );
}
