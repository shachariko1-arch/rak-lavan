import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Locale routing. Marketing pages and the dashboard live under /en and /he.
 * A request without a locale is redirected to the visitor's saved choice, or to the
 * best match for their browser language. Invitation links (/invite/…) are not touched:
 * an invitation speaks the wedding's language, not the visitor's.
 */

const LOCALES = ["en", "he"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";
const LOCALE_COOKIE = "vow_locale";

function fromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    // "iw" is the legacy code some browsers still send for Hebrew.
    if (tag === "he" || tag.startsWith("he-") || tag === "iw" || tag.startsWith("iw-")) return "he";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = (LOCALES as readonly string[]).includes(saved ?? "")
    ? (saved as Locale)
    : fromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes, invitation links, Next internals and files with an extension.
  matcher: ["/((?!api|invite|_next/static|_next/image|.*\\..*).*)"],
};
