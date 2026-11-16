export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "vow-lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

/** BCP-47 tag used for Intl formatting. */
export function intlTag(locale: Locale) {
  return locale === "he" ? "he-IL" : "en-GB";
}

/** Pick the localized variant of a {en, he} record. */
export function pick<T>(record: Record<Locale, T>, locale: Locale): T {
  return record[locale] ?? record.en;
}
