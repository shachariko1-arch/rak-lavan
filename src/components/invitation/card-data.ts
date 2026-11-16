import type { Locale, Wedding } from "@/lib/types";
import { formatWeddingDate, hebrewCalendarDate, parseDateOnly } from "@/lib/utils";

/** Everything a card design needs, already localised and formatted. */
export interface CardData {
  locale: Locale;
  bride: string;
  groom: string;
  families: string;
  initialA: string;
  initialB: string;
  opening: string;
  invitation: string;
  closing: string;
  weekday: string;
  dateMedium: string;
  dateNumeric: string;
  day: string;
  month: string;
  monthNumber: string;
  year: string;
  hebrewDate: string;
  receptionTime: string;
  ceremonyTime: string;
  venue: string;
  address: string;
  photo?: string;
  hasDate: boolean;
  labels: {
    reception: string;
    ceremony: string;
    when: string;
    where: string;
    issue: string;
    weddingOf: string;
  };
  /** Weighted length of the longest name, for fitting headline sizes. */
  nameLength: number;
}

const firstGlyph = (value: string): string => Array.from(value.trim())[0]?.toUpperCase() ?? "";

export function buildCardData(wedding: Wedding, locale: Locale): CardData {
  const he = locale === "he";
  const pick = (value: { en: string; he: string } | undefined) =>
    value ? value[locale] || value.en || value.he || "" : "";

  const bride = pick(wedding.bride) || (he ? "הכלה" : "Bride");
  const groom = pick(wedding.groom) || (he ? "החתן" : "Groom");
  const brideLast = pick(wedding.brideLast);
  const groomLast = pick(wedding.groomLast);
  const families =
    brideLast && groomLast
      ? he
        ? `משפחת ${brideLast} · משפחת ${groomLast}`
        : `The ${brideLast} & ${groomLast} families`
      : "";

  const hasDate = Boolean(wedding.date) && !Number.isNaN(parseDateOnly(wedding.date).getTime());
  const [year = "", monthNumber = "", day = ""] = hasDate ? wedding.date.split("-") : [];
  const month = hasDate
    ? new Intl.DateTimeFormat(he ? "he-IL" : "en-GB", { month: "long", timeZone: "UTC" }).format(parseDateOnly(wedding.date))
    : "";

  const text = wedding.text[locale];
  const fallback = wedding.text[he ? "en" : "he"];
  // Hebrew letters set wider than Latin ones at the same size.
  const widthFactor = he ? 1.12 : 1;

  return {
    locale,
    bride,
    groom,
    families,
    initialA: firstGlyph(bride),
    initialB: firstGlyph(groom),
    opening: text?.opening || fallback?.opening || "",
    invitation: text?.invitation || fallback?.invitation || "",
    closing: text?.closing || fallback?.closing || "",
    weekday: hasDate ? formatWeddingDate(wedding.date, locale, "weekday") : "",
    dateMedium: hasDate ? formatWeddingDate(wedding.date, locale, "medium") : he ? "התאריך יפורסם בקרוב" : "Date to be announced",
    dateNumeric: hasDate ? formatWeddingDate(wedding.date, locale, "numeric") : "",
    day: hasDate ? String(Number(day)) : "—",
    month,
    monthNumber,
    year,
    hebrewDate: he && hasDate ? hebrewCalendarDate(wedding.date) : "",
    receptionTime: wedding.receptionTime,
    ceremonyTime: wedding.ceremonyTime,
    venue: pick(wedding.venue) || (he ? "מקום האירוע" : "The venue"),
    address: pick(wedding.address),
    photo: wedding.photos[0],
    hasDate,
    labels: {
      reception: he ? "קבלת פנים" : "Reception",
      ceremony: he ? "חופה וקידושין" : "Ceremony",
      when: he ? "מתי" : "When",
      where: he ? "איפה" : "Where",
      issue: he ? "גיליון החתונה" : "The Wedding Issue",
      weddingOf: he ? "החתונה של" : "The wedding of",
    },
    nameLength: Math.max(Array.from(bride).length, Array.from(groom).length) * widthFactor,
  };
}

/** Shrinks a headline size so the longest name still fits on one line. */
export const fitSize = (base: number, comfortable: number, length: number): number =>
  Math.round(base * Math.min(1, comfortable / Math.max(1, length)) * 100) / 100;
