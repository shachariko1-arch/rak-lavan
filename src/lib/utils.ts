import type { L10n, Locale } from "./types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const pick = (locale: Locale, value: L10n): string => value[locale] || value.en || value.he;

export const l10n = (en: string, he: string = en): L10n => ({ en, he });

/** Deterministic PRNG so the demo wedding is identical for everyone. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function randomId(length = 12, rand: () => number = cryptoRandom): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ID_ALPHABET[Math.floor(rand() * ID_ALPHABET.length)];
  return out;
}

function cryptoRandom(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

const HEBREW_TRANSLIT: Record<string, string> = {
  א: "a", ב: "b", ג: "g", ד: "d", ה: "h", ו: "o", ז: "z", ח: "ch", ט: "t", י: "i", כ: "k", ך: "ch",
  ל: "l", מ: "m", ם: "m", נ: "n", ן: "n", ס: "s", ע: "a", פ: "p", ף: "f", צ: "tz", ץ: "tz", ק: "k",
  ר: "r", ש: "sh", ת: "t",
};

/** URL-safe slug. Hebrew is roughly transliterated so a link is still readable. */
export function slugify(input: string): string {
  const latin = Array.from(input.trim().toLowerCase())
    .map((ch) => HEBREW_TRANSLIT[ch] ?? ch)
    .join("");
  return latin
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function coupleSlug(groom: string, bride: string): string {
  const a = slugify(groom);
  const b = slugify(bride);
  if (a && b) return `${a}-and-${b}`;
  return a || b || `wedding-${randomId(6)}`;
}

/* ───────────────────────── Phone numbers ───────────────────────── */

/** Digits only, in international form without "+". Israeli local numbers get the 972 prefix. */
export function normalizePhone(raw: string, defaultCountry = "972"): string {
  let digits = (raw || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = defaultCountry + digits.slice(1);
  return digits.replace(/\D/g, "");
}

/** Pretty local display: 972521234567 → 052-123-4567. Other countries are shown as +digits. */
export function formatPhone(raw: string): string {
  const d = normalizePhone(raw);
  if (!d) return "";
  if (d.startsWith("972") && d.length === 12) {
    const local = "0" + d.slice(3);
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return `+${d}`;
}

export const isValidPhone = (raw: string): boolean => {
  const d = normalizePhone(raw);
  return d.length >= 9 && d.length <= 15;
};

/* ───────────────────────── Dates ─────────────────────────
   Wedding dates are calendar dates (YYYY-MM-DD), not instants, so they are always
   formatted in UTC. That keeps server and browser output identical. */

const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", he: "he-IL" };

export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
}

export function formatWeddingDate(
  date: string,
  locale: Locale,
  style: "long" | "medium" | "numeric" | "weekday" | "monthYear" = "long",
): string {
  if (!date) return "";
  const dt = parseDateOnly(date);
  if (Number.isNaN(dt.getTime())) return "";
  if (style === "numeric") {
    const [y, m, d] = date.split("-");
    return `${d}.${m}.${y}`;
  }
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : style === "medium"
        ? { day: "numeric", month: "long", year: "numeric" }
        : style === "weekday"
          ? { weekday: "long" }
          : { month: "long", year: "numeric" };
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...options, timeZone: "UTC" }).format(dt);
}

const GEMATRIA_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const GEMATRIA_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const GEMATRIA_HUNDREDS = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];

/** 13 → י״ג, 787 → תשפ״ז. Handles the 15/16 exceptions. */
export function gematria(n: number): string {
  let value = n % 1000;
  let out = GEMATRIA_HUNDREDS[Math.floor(value / 100)];
  value %= 100;
  if (value === 15) out += "טו";
  else if (value === 16) out += "טז";
  else out += GEMATRIA_TENS[Math.floor(value / 10)] + GEMATRIA_ONES[value % 10];
  if (out.length === 1) return `${out}׳`;
  return `${out.slice(0, -1)}״${out.slice(-1)}`;
}

/** Hebrew-calendar date as printed on Israeli invitations, e.g. "י״ג בסיוון תשפ״ז". */
export function hebrewCalendarDate(date: string): string {
  if (!date) return "";
  try {
    const dt = parseDateOnly(date);
    const parts = new Intl.DateTimeFormat("he-IL-u-ca-hebrew-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).formatToParts(dt);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const year = Number(parts.find((p) => p.type === "year")?.value);
    if (!day || !year || !month) return "";
    return `${gematria(day)} ב${month} ${gematria(year)}`;
  } catch {
    return "";
  }
}

/** Timestamps (ISO instants) for tables and activity feeds. Client-only rendering. */
export function formatDateTime(iso: string | null, locale: Locale, withTime = false): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(dt);
}

export function formatRelative(iso: string | null, locale: Locale, now = Date.now()): string {
  if (!iso) return "—";
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(Math.trunc(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.trunc(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.trunc(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.trunc(diffSec / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.trunc(diffSec / (86400 * 30)), "month");
  return rtf.format(Math.trunc(diffSec / (86400 * 365)), "year");
}

export function formatNumber(n: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], options).format(n);
}

/** Whole days from today (local) until the wedding date. Negative once it has passed. */
export function daysUntil(date: string, now = new Date()): number {
  const target = parseDateOnly(date).getTime();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

/** The wedding moment as a local-time Date, for countdowns and calendar files. */
export function weddingMoment(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = Array.from(parts[0])[0] ?? "";
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** #rrggbb → relative luminance, for choosing readable text on arbitrary palette colours. */
export function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const isHexColor = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

/** Mix two hex colours. t=0 → a, t=1 → b. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const va = (pa >> shift) & 255;
    const vb = (pb >> shift) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
