import type { Locale } from "@/lib/i18n/config";
import { intlTag } from "@/lib/i18n/config";
import type { WeddingFacts } from "./schema";

/** "Noa & Daniel" / "נועה ודניאל" — respects the couple's display order. */
export function coupleNames(f: Pick<WeddingFacts, "brideFirstName" | "groomFirstName" | "displayOrder">, locale: Locale) {
  const a = f.displayOrder === "groom_first" ? f.groomFirstName : f.brideFirstName;
  const b = f.displayOrder === "groom_first" ? f.brideFirstName : f.groomFirstName;
  const first = (a || "").trim();
  const second = (b || "").trim();
  if (!first && !second) return "";
  if (!second) return first;
  if (!first) return second;
  // Hebrew conjunction attaches to the second name ("ו").
  return locale === "he" ? `${first} ו${second}` : `${first} & ${second}`;
}

export function coupleNameParts(f: Pick<WeddingFacts, "brideFirstName" | "groomFirstName" | "displayOrder">) {
  const a = f.displayOrder === "groom_first" ? f.groomFirstName : f.brideFirstName;
  const b = f.displayOrder === "groom_first" ? f.brideFirstName : f.groomFirstName;
  return [(a || "").trim(), (b || "").trim()] as const;
}

export function coupleInitials(f: Pick<WeddingFacts, "brideFirstName" | "groomFirstName" | "displayOrder">) {
  const [a, b] = coupleNameParts(f);
  return [a.charAt(0), b.charAt(0)].filter(Boolean).join("").toUpperCase();
}

/** Offset in ms between UTC and the given zone at a given instant. */
function zoneOffset(timeZone: string, instant: number) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant;
}

/** Convert a wall-clock date + time in a time zone to a UTC Date (DST-safe). */
export function zonedToUtc(date: string, time: string | null, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let tz = "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    tz = timeZone;
  } catch {
    tz = "UTC";
  }
  const first = guess - zoneOffset(tz, guess);
  const second = guess - zoneOffset(tz, first);
  return new Date(second);
}

/** The moment the celebration starts: ceremony → reception → midnight. */
export function eventStart(f: Pick<WeddingFacts, "date" | "ceremonyTime" | "receptionTime" | "timezone">): Date | null {
  if (!f.date) return null;
  const time = earliestTime(f.ceremonyTime, f.receptionTime);
  return zonedToUtc(f.date, time, f.timezone || "Asia/Jerusalem");
}

function earliestTime(a: string | null, b: string | null) {
  if (a && b) return a < b ? a : b;
  return a || b || null;
}

export function formatWeddingDate(date: string | null, locale: Locale, style: "long" | "dots" = "long") {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  if (style === "dots") return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
  return new Intl.DateTimeFormat(intlTag(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatTime(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; past: boolean };

export function countdownTo(target: Date | null, now = Date.now()): Countdown {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: false };
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past: false,
  };
}

export function fullAddress(f: Pick<WeddingFacts, "venueName" | "venueAddress" | "city">) {
  return [f.venueName, f.venueAddress, f.city].map((s) => s?.trim()).filter(Boolean).join(", ");
}

/** A universal maps link (opens Google Maps app / site; Waze users get a choice on mobile). */
export function mapsUrl(f: Pick<WeddingFacts, "venueName" | "venueAddress" | "city">) {
  const q = fullAddress(f);
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function wazeUrl(f: Pick<WeddingFacts, "venueName" | "venueAddress" | "city">) {
  const q = fullAddress(f);
  if (!q) return null;
  return `https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`;
}

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export type CalendarEvent = { title: string; description: string; location: string; start: Date; end: Date; uid: string; url?: string };

export function calendarEvent(f: WeddingFacts, locale: Locale, url?: string): CalendarEvent | null {
  const start = eventStart(f);
  if (!start) return null;
  const end = new Date(start.getTime() + 6 * 3600 * 1000);
  const names = coupleNames(f, locale);
  return {
    title: locale === "he" ? `החתונה של ${names}` : `${names} — Wedding`,
    description: [f.eventDetails, url].filter(Boolean).join("\n\n"),
    location: fullAddress(f),
    start,
    end,
    uid: `${icsDate(start)}-${names.replace(/[^\p{L}\p{N}]+/gu, "-")}@vow`,
    url,
  };
}

export function toIcs(e: CalendarEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VOW//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(e.start)}`,
    `DTEND:${icsDate(e.end)}`,
    `SUMMARY:${icsEscape(e.title)}`,
    e.location ? `LOCATION:${icsEscape(e.location)}` : "",
    e.description ? `DESCRIPTION:${icsEscape(e.description)}` : "",
    e.url ? `URL:${e.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${icsDate(e.start)}/${icsDate(e.end)}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Demo facts used for marketing previews and template galleries. */
export const DEMO_FACTS: Record<Locale, WeddingFacts> = {
  en: {
    brideFirstName: "Noa",
    brideLastName: "Levi",
    groomFirstName: "Daniel",
    groomLastName: "Cohen",
    displayOrder: "bride_first",
    date: "2027-06-18",
    ceremonyTime: "19:30",
    receptionTime: "18:30",
    timezone: "Asia/Jerusalem",
    venueName: "Villa Kalia",
    venueAddress: "Ha-Yam Street 4",
    city: "Caesarea",
    eventDetails: "",
  },
  he: {
    brideFirstName: "נועה",
    brideLastName: "לוי",
    groomFirstName: "דניאל",
    groomLastName: "כהן",
    displayOrder: "bride_first",
    date: "2027-06-18",
    ceremonyTime: "19:30",
    receptionTime: "18:30",
    timezone: "Asia/Jerusalem",
    venueName: "וילה קליה",
    venueAddress: "רחוב הים 4",
    city: "קיסריה",
    eventDetails: "",
  },
};
