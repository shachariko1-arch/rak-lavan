"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNow } from "@/hooks/use-now";
import type { Locale } from "@/lib/i18n/config";
import { countdownTo } from "@/lib/invitation/facts";
import { cn } from "@/lib/utils";
import { inviteCopy } from "./copy";

type Props = {
  target: Date | null;
  locale: Locale;
  /** "invite" uses invitation theme vars; "app" uses the dashboard palette. */
  tone?: "invite" | "app" | "dark";
  className?: string;
  showSeconds?: boolean;
};

/** Live countdown to the wedding moment (timezone-correct target computed by caller). */
export function WeddingCountdown({ target, locale, tone = "invite", className, showSeconds = true }: Props) {
  const now = useNow(1000);
  const t = inviteCopy[locale];
  const c = countdownTo(target, now ?? target?.getTime() ?? 0);
  const units = [
    { key: "d", label: t.days, value: c.days },
    { key: "h", label: t.hours, value: c.hours },
    { key: "m", label: t.minutes, value: c.minutes },
    ...(showSeconds ? [{ key: "s", label: t.seconds, value: c.seconds }] : []),
  ];

  if (target && now !== null && c.past) {
    const sameDay = now - target.getTime() < 18 * 3600 * 1000;
    return <p className={cn("text-center", className)}>{sameDay ? t.today : t.married}</p>;
  }

  return (
    <div
      className={cn("grid gap-[clamp(8px,3cqw,20px)]", showSeconds ? "grid-cols-4" : "grid-cols-3", className)}
      role="timer"
      aria-live="off"
      aria-label={units.map((u) => `${u.value} ${u.label}`).join(", ")}
      dir="ltr"
    >
      {(locale === "he" ? [...units].reverse() : units).map((u) => (
        <div key={u.key} className="flex flex-col items-center">
          <Digit value={now === null ? null : u.value} tone={tone} />
          <span
            className={cn(
              "mt-2 uppercase",
              tone === "invite" && "inv-eyebrow",
              tone === "app" && "text-[11px] tracking-[0.18em] text-ink-2",
              tone === "dark" && "text-[11px] tracking-[0.18em] text-mist",
            )}
            style={tone === "invite" ? { color: "var(--inv-text-2)" } : undefined}
            dir={locale === "he" ? "rtl" : "ltr"}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Digit({ value, tone }: { value: number | null; tone: Props["tone"] }) {
  const reduce = useReducedMotion();
  const text = value === null ? "––" : String(value).padStart(2, "0");
  return (
    <span
      className={cn(
        "relative block overflow-hidden tabular-nums leading-none",
        tone === "invite" && "inv-date",
        tone === "app" && "font-display text-[clamp(2rem,4vw,3rem)] text-ink",
        tone === "dark" && "font-display text-[clamp(2rem,4vw,3rem)] text-pearl",
      )}
      style={tone === "invite" ? { fontFamily: "var(--inv-display)", color: "var(--inv-text)" } : undefined}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="block"
          initial={reduce ? { opacity: 0 } : { y: "-60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "60%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
