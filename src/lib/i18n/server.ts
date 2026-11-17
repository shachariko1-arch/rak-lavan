import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/** Resolve the visitor's language: cookie → Accept-Language → default. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  if (/^he\b|,\s*he\b|^iw\b/i.test(accept)) return "he";
  return DEFAULT_LOCALE;
}
