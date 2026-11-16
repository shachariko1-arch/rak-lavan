import { coupleNames } from "./messaging/templates";
import type { Locale, Wedding } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Floating local time (no zone): the event shows at the wedding's wall-clock time. */
function stamp(date: string, time: string, addHours = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, (hh || 0) + addHours, mm || 0);
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
}

const place = (w: Wedding, locale: Locale) =>
  [w.venue[locale] || w.venue.en, w.address[locale] || w.address.en].filter(Boolean).join(", ");

const title = (w: Wedding, locale: Locale) =>
  locale === "he" ? `החתונה של ${coupleNames(w, locale)}` : `${coupleNames(w, locale)} — Wedding`;

export function googleCalendarUrl(w: Wedding, locale: Locale): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(w, locale),
    dates: `${stamp(w.date, w.receptionTime)}/${stamp(w.date, w.receptionTime, 6)}`,
    location: place(w, locale),
    details: locale === "he" ? `חופה בשעה ${w.ceremonyTime}` : `Ceremony at ${w.ceremonyTime}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** .ics file for Apple Calendar, Outlook and everything else. */
export function icsFile(w: Wedding, locale: Locale): Blob {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VOW//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${w.id}@vow`,
    `DTSTAMP:${stamp(new Date().toISOString().slice(0, 10), "00:00")}`,
    `DTSTART:${stamp(w.date, w.receptionTime)}`,
    `DTEND:${stamp(w.date, w.receptionTime, 6)}`,
    `SUMMARY:${esc(title(w, locale))}`,
    `LOCATION:${esc(place(w, locale))}`,
    `DESCRIPTION:${esc(locale === "he" ? `חופה בשעה ${w.ceremonyTime}` : `Ceremony at ${w.ceremonyTime}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
}

export const googleMapsUrl = (w: Wedding, locale: Locale) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place(w, locale))}`;

export const wazeUrl = (w: Wedding, locale: Locale) =>
  `https://waze.com/ul?q=${encodeURIComponent(place(w, locale))}&navigate=yes`;
