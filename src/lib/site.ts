/** Brand constants. One place to change the product name or public domain. */
export const SITE = {
  name: "VOW",
  /** Shown in example links. The real origin is always read from the browser at runtime. */
  displayDomain: "vow.app",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
} as const;

export const LOCALE_COOKIE = "vow_locale";

export const inviteUrl = (origin: string, slug: string, token?: string | null): string =>
  `${origin.replace(/\/$/, "")}/invite/${slug}${token ? `?g=${token}` : ""}`;

/** The pretty form used in copy: vow.app/invite/daniel-and-noa */
export const inviteDisplayUrl = (slug: string): string => `${SITE.displayDomain}/invite/${slug}`;

export const currentOrigin = (): string =>
  typeof window !== "undefined" ? window.location.origin : SITE.url;
