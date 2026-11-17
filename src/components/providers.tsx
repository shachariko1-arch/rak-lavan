"use client";

import { MotionConfig } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/client";

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LocaleProvider>
  );
}
