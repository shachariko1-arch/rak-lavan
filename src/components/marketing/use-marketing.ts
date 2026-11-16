"use client";

import { useLocale } from "@/lib/i18n/client";
import { getMarketingDict } from "@/lib/i18n/dictionaries";

export function useMarketing() {
  const { locale } = useLocale();
  return getMarketingDict(locale);
}
