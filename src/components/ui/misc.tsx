"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, CircleDashed, Clock, Globe, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { STATUS_LABEL } from "@/lib/labels";
import { LOCALE_COOKIE } from "@/lib/site";
import type { Locale, RsvpStatus } from "@/lib/types";
import { cn, formatNumber, initials } from "@/lib/utils";

/* ───────────────────────── Logo ───────────────────────── */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" aria-hidden className={cn("h-5 w-auto", className)} fill="none">
      <circle cx="14" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Two interlocked rings and the wordmark. */
export function Logo({ className, href, tone = "dark" }: { className?: string; href?: string; tone?: "dark" | "light" }) {
  const { tr } = useI18n();
  const content = (
    <span
      dir="ltr"
      className={cn(
        "inline-flex items-center gap-2.5 font-serif text-[22px] font-medium leading-none tracking-[0.32em]",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
      style={{ fontFamily: '"Cormorant Garamond", serif' }}
    >
      <LogoMark className={tone === "light" ? "text-gold-soft" : "text-gold"} />
      <span className="-me-[0.32em]">VOW</span>
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label={tr("VOW, home", "VOW, לעמוד הבית")} className="inline-flex rounded-md">
      {content}
    </Link>
  );
}

/* ───────────────────────── Language ───────────────────────── */

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

/** Switches between /en/… and /he/… while staying on the same page. */
export function LanguageToggle({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const other: Locale = locale === "he" ? "en" : "he";

  const onSwitch = () => {
    setLocaleCookie(other);
    const rest = (pathname || "/").replace(/^\/(en|he)(?=\/|$)/, "");
    router.push(`/${other}${rest}${window.location.search}${window.location.hash}`);
  };

  return (
    <button
      type="button"
      onClick={onSwitch}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
        tone === "light" ? "text-white/85 hover:bg-white/12 hover:text-white" : "text-ink-soft hover:bg-ink/5",
        className,
      )}
    >
      <Globe aria-hidden className="size-4 opacity-70" />
      <span lang={other}>{other === "he" ? "עברית" : "English"}</span>
    </button>
  );
}

/* ───────────────────────── Status ───────────────────────── */

export const STATUS_STYLE: Record<RsvpStatus, { badge: string; dot: string; icon: typeof Check; text: string }> = {
  confirmed: { badge: "bg-confirmed-soft text-confirmed-ink", dot: "bg-confirmed", icon: Check, text: "text-confirmed" },
  declined: { badge: "bg-declined-soft text-declined-ink", dot: "bg-declined", icon: X, text: "text-declined" },
  pending: { badge: "bg-pending-soft text-pending-ink", dot: "bg-pending", icon: Clock, text: "text-pending-ink" },
  not_contacted: { badge: "bg-idle-soft text-idle-ink", dot: "bg-idle", icon: CircleDashed, text: "text-idle-ink" },
};

/** Colour is never the only signal: every status carries an icon and its name. */
export function StatusBadge({ status, className }: { status: RsvpStatus; className?: string }) {
  const { pick } = useI18n();
  const style = STATUS_STYLE[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        style.badge,
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.5} className="size-3" />
      {pick(STATUS_LABEL[status])}
    </span>
  );
}

/* ───────────────────────── Bits ───────────────────────── */

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-champagne/70 text-xs font-semibold tracking-wide text-gold-deep",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-3xl border border-line bg-white/75 shadow-card", className)} {...rest}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-cream text-gold-deep [&>svg]:size-6">{icon}</div>
      ) : null}
      <h3 className="font-serif text-2xl text-ink he:text-xl">{title}</h3>
      {body ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  tabs: { value: T; label: ReactNode; count?: number; dot?: string }[];
  label: string;
  className?: string;
}

/** Underlined tabs with a sliding indicator. Arrow keys move between tabs. */
export function Tabs<T extends string>({ value, onChange, tabs, label, className }: TabsProps<T>) {
  const { locale, isRtl } = useI18n();
  const id = useId();
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const forward = isRtl ? "ArrowLeft" : "ArrowRight";
    const back = isRtl ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (event.key === forward) next = (index + 1) % tabs.length;
    else if (event.key === back) next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].value);
    const container = event.currentTarget.parentElement;
    (container?.children[next] as HTMLElement | undefined)?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("no-scrollbar flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {tabs.map((tab, index) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 pb-3 pt-2 text-sm transition-colors",
              active ? "font-medium text-ink" : "text-stone hover:text-ink",
            )}
          >
            {tab.dot ? <span aria-hidden className={cn("size-2 rounded-full", tab.dot)} /> : null}
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "tabular rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none",
                  active ? "bg-ink text-ivory" : "bg-cream text-stone",
                )}
              >
                {formatNumber(tab.count, locale)}
              </span>
            ) : null}
            {active ? (
              <motion.span
                layoutId={`tab-underline-${id}`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Motion helpers ───────────────────────── */

interface AnimatedNumberProps {
  value: number;
  /** Format the in-flight value. Defaults to a localised integer. */
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

/** Counts up to the value when it scrolls into view, and again whenever the value changes. */
export function AnimatedNumber({ value, format, duration = 1.4, className }: AnimatedNumberProps) {
  const { locale } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const previous = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;
  const render = (n: number) => (formatRef.current ? formatRef.current(n) : formatNumber(Math.round(n), locale));
  const [text, setText] = useState(() => render(0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      previous.current = value;
      setText(render(value));
      return;
    }
    const controls = animate(previous.current, value, {
      duration: previous.current === 0 ? duration : 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setText(render(latest)),
    });
    previous.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduce, locale, duration]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {text}
    </span>
  );
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
}

/** Fades content up as it enters the viewport. */
export function Reveal({ children, delay = 0, y = 22, className, once = true, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
