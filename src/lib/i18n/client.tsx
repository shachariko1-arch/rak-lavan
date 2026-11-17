"use client";

import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dirOf, intlTag, LOCALE_COOKIE, type Locale } from "./config";

type LocaleContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  pending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      try {
        localStorage.setItem(LOCALE_COOKIE, next);
      } catch {
        /* storage may be unavailable */
      }
      document.documentElement.lang = next;
      document.documentElement.dir = dirOf(next);
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo(() => ({ locale, dir: dirOf(locale), setLocale, pending }), [locale, setLocale, pending]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

export function useFormatters() {
  const { locale } = useLocale();
  return useMemo(() => formatters(locale), [locale]);
}

export function formatters(locale: Locale) {
  const tag = intlTag(locale);
  const number = new Intl.NumberFormat(tag);
  const percent = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 1 });
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" });
  const shortDate = new Intl.DateTimeFormat(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
  const dateTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  return {
    number: (n: number) => number.format(n),
    percent: (n: number) => percent.format(n),
    date: (d: Date | string) => date.format(typeof d === "string" ? new Date(d) : d),
    shortDate: (d: Date | string) => shortDate.format(typeof d === "string" ? new Date(d) : d),
    dateTime: (d: Date | string) => dateTime.format(typeof d === "string" ? new Date(d) : d),
    relative: (d: Date | string) => {
      const diff = (new Date(d).getTime() - Date.now()) / 1000;
      const abs = Math.abs(diff);
      if (abs < 60) return relative.format(Math.round(diff), "second");
      if (abs < 3600) return relative.format(Math.round(diff / 60), "minute");
      if (abs < 86400) return relative.format(Math.round(diff / 3600), "hour");
      if (abs < 86400 * 30) return relative.format(Math.round(diff / 86400), "day");
      return date.format(new Date(d));
    },
  };
}
