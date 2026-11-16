import type { Guest, L10n, Locale, MessageTemplates, Wedding } from "../types";
import { inviteUrl } from "../site";
import { formatWeddingDate, l10n } from "../utils";

export type MessageKind = keyof MessageTemplates;

export const TEMPLATE_VARIABLES: { key: string; label: L10n }[] = [
  { key: "guest_name", label: l10n("Guest's first name", "שם פרטי של האורח") },
  { key: "guest_full_name", label: l10n("Guest's full name", "שם מלא של האורח") },
  { key: "couple", label: l10n("Couple", "שמות בני הזוג") },
  { key: "date", label: l10n("Wedding date", "תאריך החתונה") },
  { key: "time", label: l10n("Reception time", "שעת קבלת הפנים") },
  { key: "venue", label: l10n("Venue", "מקום האירוע") },
  { key: "link", label: l10n("Personal RSVP link", "קישור אישי לאישור הגעה") },
];

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplates = {
  invite: {
    en: "Hi {{guest_name}} 🤍\n{{couple}} are getting married, and would love to celebrate with you.\n{{date}} · {{venue}}\n\nYour personal invitation and RSVP:\n{{link}}",
    he: "היי {{guest_name}} 🤍\n{{couple}} מתחתנים, ונשמח מאוד לחגוג איתך!\n{{date}} · {{venue}}\n\nההזמנה האישית שלך ואישור הגעה:\n{{link}}",
  },
  reminder: {
    en: "Hi {{guest_name}}, a gentle reminder from {{couple}} 🤍\nWe would love to know if you can join us on {{date}}. It takes less than a minute:\n{{link}}",
    he: "היי {{guest_name}}, תזכורת קטנה מ{{couple}} 🤍\nנשמח לדעת אם תגיעו לחתונה שלנו ב{{date}}. זה לוקח פחות מדקה:\n{{link}}",
  },
};

export function coupleNames(wedding: Pick<Wedding, "bride" | "groom">, locale: Locale): string {
  const bride = wedding.bride[locale] || wedding.bride.en || wedding.bride.he;
  const groom = wedding.groom[locale] || wedding.groom.en || wedding.groom.he;
  if (!bride || !groom) return bride || groom || "";
  return locale === "he" ? `${bride} ו${groom}` : `${bride} & ${groom}`;
}

export const guestDisplayName = (guest: Pick<Guest, "name" | "nameHe">, locale: Locale): string =>
  (locale === "he" && guest.nameHe) || guest.name;

/** "Yael Shapiro" → "Yael". Joint names such as "Yael & Amit Shapiro" are kept whole. */
export function guestFirstName(fullName: string): string {
  const name = fullName.trim();
  if (/[&+]| and | ו[א-ת]/.test(name)) return name;
  return name.split(/\s+/)[0] ?? name;
}

export function messageVariables(
  wedding: Wedding,
  guest: Pick<Guest, "name" | "nameHe" | "token">,
  locale: Locale,
  origin: string,
): Record<string, string> {
  const full = guestDisplayName(guest, locale);
  return {
    guest_name: guestFirstName(full),
    guest_full_name: full,
    couple: coupleNames(wedding, locale),
    date: formatWeddingDate(wedding.date, locale, "long"),
    time: wedding.receptionTime,
    venue: wedding.venue[locale] || wedding.venue.en || wedding.venue.he,
    link: inviteUrl(origin, wedding.slug, guest.token),
  };
}

/** Replaces {{variables}}. Unknown variables are left visible so mistakes are easy to spot. */
export function renderMessage(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = vars[key.toLowerCase()];
    return value === undefined ? match : value;
  });
}

export function buildGuestMessage(
  kind: MessageKind,
  wedding: Wedding,
  guest: Pick<Guest, "name" | "nameHe" | "token">,
  locale: Locale,
  origin: string,
): string {
  const template =
    wedding.messageTemplates?.[kind]?.[locale] || DEFAULT_MESSAGE_TEMPLATES[kind][locale];
  return renderMessage(template, messageVariables(wedding, guest, locale, origin));
}
