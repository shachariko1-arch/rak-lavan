"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; label: string; lang: string }[] = [
  { value: "en", label: "EN", lang: "en" },
  { value: "he", label: "עברית", lang: "he" },
];

/** EN / עברית toggle. Changes content and layout direction, persisted in a cookie. */
export function LanguageSwitcher({ tone = "dark", className, label = "Language" }: { tone?: "dark" | "light"; className?: string; label?: string }) {
  const { locale, setLocale, pending } = useLocale();
  const pillId = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "relative inline-flex items-center rounded-full border p-0.5 text-[12px] font-medium",
        tone === "dark" ? "border-white/15 bg-white/[.03]" : "border-hairline bg-card",
        pending && "opacity-70",
        className,
      )}
      dir="ltr"
    >
      {OPTIONS.map((o) => {
        const active = o.value === locale;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            lang={o.lang}
            onClick={() => !active && setLocale(o.value)}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5 transition-colors",
              tone === "dark" ? (active ? "text-night" : "text-mist hover:text-pearl") : active ? "text-white" : "text-ink-2 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${pillId}`}
                className={cn("absolute inset-0 -z-10 rounded-full", tone === "dark" ? "bg-champagne" : "bg-ink")}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
