"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { L10n, Locale } from "./types";

export interface I18n {
  locale: Locale;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  /** Inline translation: tr("Guests", "אורחים"). */
  tr: (en: string, he: string) => string;
  /** Read a stored bilingual value, falling back to whichever language exists. */
  pick: (value: L10n | null | undefined) => string;
  /** Prefix an app path with the current locale: href("/dashboard") → "/he/dashboard". */
  href: (path: string) => string;
}

const build = (locale: Locale): I18n => ({
  locale,
  dir: locale === "he" ? "rtl" : "ltr",
  isRtl: locale === "he",
  tr: (en, he) => (locale === "he" ? he : en),
  pick: (value) => (value ? value[locale] || value.en || value.he || "" : ""),
  href: (path) => `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`,
});

const I18nContext = createContext<I18n>(build("en"));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => build(locale), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = (): I18n => useContext(I18nContext);
