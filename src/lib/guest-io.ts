import { newGuest } from "./data/rsvp";
import { CATEGORY_LABEL, DIETARY_LABEL, SIDE_LABEL, STATUS_LABEL } from "./labels";
import { maxParty } from "./types";
import type { Dietary, Guest, GuestCategory, Locale, Side } from "./types";
import { formatPhone, normalizePhone } from "./utils";

/* ───────────────────────── Export ───────────────────────── */

export function dietarySummary(guest: Guest, locale: Locale): string {
  const counts = new Map<Dietary, number>();
  for (const member of guest.party) if (member.meal !== "regular") counts.set(member.meal, (counts.get(member.meal) ?? 0) + 1);
  return [...counts.entries()].map(([meal, n]) => `${DIETARY_LABEL[meal][locale]}${n > 1 ? ` ×${n}` : ""}`).join(", ");
}

const iso = (value: string | null) => (value ? value.slice(0, 16).replace("T", " ") : "");

export function exportRows(guests: Guest[], locale: Locale, inviteLink: (g: Guest) => string): (string | number)[][] {
  const he = locale === "he";
  const header = he
    ? ["שם", "טלפון", "קבוצה", "קטגוריה", "צד", "מוזמנים", "מגיעים", "סטטוס", "העדפות תזונה", "שמות המגיעים", "בקשות מיוחדות", "הודעה", "שולחן", "הזמנה נשלחה", "תשובה אחרונה", "קישור אישי"]
    : ["Name", "Phone", "Group", "Category", "Side", "Invited", "Attending", "Status", "Dietary", "Party names", "Special requests", "Message", "Table", "Invitation sent", "Last response", "Personal link"];
  const rows = guests.map((g) => [
    (he && g.nameHe) || g.name,
    formatPhone(g.phone),
    (he && g.groupHe) || g.group,
    CATEGORY_LABEL[g.category][locale],
    SIDE_LABEL[g.side][locale],
    maxParty(g),
    g.attendees,
    STATUS_LABEL[g.status][locale],
    dietarySummary(g, locale),
    g.party.map((m) => m.name).filter(Boolean).join(", "),
    g.specialRequests,
    g.message,
    g.table,
    iso(g.invitationSentAt),
    iso(g.lastResponseAt),
    inviteLink(g),
  ]);
  return [header, ...rows];
}

/** CSV with a BOM so Excel opens Hebrew correctly. Formula-looking cells are neutralised. */
export function toCsv(rows: (string | number)[][]): Blob {
  const cell = (value: string | number) => {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text) && typeof value === "string") text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return new Blob(["﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
}

export async function toXlsx(rows: (string | number)[][]): Promise<Blob> {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  const data = rows.map((row, r) =>
    row.map((value) => ({
      value,
      type: typeof value === "number" ? Number : String,
      ...(r === 0 ? { fontWeight: "bold" as const } : {}),
    })),
  );
  const columns = rows[0].map((_, i) => ({ width: [24, 16, 26, 12, 14, 9, 10, 18, 22, 30, 30, 30, 8, 18, 18, 46][i] ?? 16 }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (writeExcelFile as any)(data, { columns }).toBlob();
}

/* ───────────────────────── Import ───────────────────────── */

export type ImportField = "name" | "phone" | "group" | "category" | "side" | "adults" | "children" | "plusOne" | "table" | "notes";

export const IMPORT_FIELDS: { field: ImportField; en: string; he: string; match: RegExp }[] = [
  { field: "name", en: "Guest name", he: "שם האורח", match: /name|שם|guest|אורח/i },
  { field: "phone", en: "Phone", he: "טלפון", match: /phone|mobile|tel|טלפון|נייד|cell/i },
  { field: "group", en: "Group / family", he: "קבוצה / משפחה", match: /group|family|קבוצה|משפחה/i },
  { field: "category", en: "Category", he: "קטגוריה", match: /categor|קטגוריה|סוג/i },
  { field: "side", en: "Side", he: "צד", match: /side|צד/i },
  { field: "adults", en: "Adults", he: "מבוגרים", match: /adult|מבוגר|invited|מוזמנים|count|כמות/i },
  { field: "children", en: "Children", he: "ילדים", match: /child|kid|ילד/i },
  { field: "plusOne", en: "Plus one", he: "פלוס אחד", match: /plus|\+1|מלווה/i },
  { field: "table", en: "Table", he: "שולחן", match: /table|שולחן/i },
  { field: "notes", en: "Notes", he: "הערות", match: /note|comment|הערות|הערה/i },
];

/** RFC 4180 CSV parser: quoted fields, escaped quotes, commas or semicolons or tabs. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

export async function readSpreadsheet(file: File): Promise<string[][]> {
  if (/\.(csv|tsv|txt)$/i.test(file.name) || file.type.startsWith("text/")) return parseCsv(await file.text());
  const { readSheet } = await import("read-excel-file/browser");
  const data = (await readSheet(file)) as unknown as unknown[][];
  return data.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c)))).filter((r) => r.some((c) => c.trim()));
}

export function guessMapping(header: string[]): Record<number, ImportField | ""> {
  const used = new Set<ImportField>();
  const mapping: Record<number, ImportField | ""> = {};
  header.forEach((title, index) => {
    const hit = IMPORT_FIELDS.find((f) => !used.has(f.field) && f.match.test(title));
    mapping[index] = hit?.field ?? "";
    if (hit) used.add(hit.field);
  });
  return mapping;
}

const CATEGORY_WORDS: [RegExp, GuestCategory][] = [[/fam|משפח/i, "family"], [/friend|חבר/i, "friends"], [/work|colleag|עבודה|עמית/i, "work"]];
const SIDE_WORDS: [RegExp, Side][] = [[/bride|כלה/i, "bride"], [/groom|חתן/i, "groom"]];
const truthy = (v: string) => /^(1|y|yes|true|כן|v|x|\+)$/i.test(v.trim());
const int = (v: string, fallback: number) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 && n <= 30 ? n : fallback;
};

export interface ImportResult {
  guests: Guest[];
  skippedEmpty: number;
  skippedDuplicates: number;
}

/** Turns mapped spreadsheet rows into guests. Rows without a name, and phones already on the list, are skipped. */
export function rowsToGuests(rows: string[][], mapping: Record<number, ImportField | "">, weddingId: string, existing: Guest[]): ImportResult {
  const phones = new Set(existing.map((g) => normalizePhone(g.phone)).filter(Boolean));
  const result: ImportResult = { guests: [], skippedEmpty: 0, skippedDuplicates: 0 };
  for (const row of rows) {
    const get = (field: ImportField) => {
      const index = Object.keys(mapping).find((k) => mapping[Number(k)] === field);
      return index === undefined ? "" : (row[Number(index)] ?? "").trim();
    };
    const name = get("name");
    if (!name) {
      result.skippedEmpty++;
      continue;
    }
    const phone = normalizePhone(get("phone"));
    if (phone && phones.has(phone)) {
      result.skippedDuplicates++;
      continue;
    }
    if (phone) phones.add(phone);
    result.guests.push(
      newGuest(weddingId, {
        name: name.slice(0, 120),
        phone,
        group: get("group"),
        category: CATEGORY_WORDS.find(([re]) => re.test(get("category")))?.[1] ?? (get("category") ? "other" : "friends"),
        side: SIDE_WORDS.find(([re]) => re.test(get("side")))?.[1] ?? "both",
        invitedAdults: Math.max(1, int(get("adults"), 1)),
        invitedChildren: int(get("children"), 0),
        plusOne: truthy(get("plusOne")),
        table: get("table"),
        notes: get("notes"),
        source: "import",
      }),
    );
  }
  return result;
}

export const IMPORT_TEMPLATE: string[][] = [
  ["Name", "Phone", "Group", "Category", "Side", "Adults", "Children", "Plus one", "Table", "Notes"],
  ["Yael Shapiro", "052-123-4567", "Shapiro family", "Family", "Bride", "2", "1", "", "", ""],
  ["Omer Golan", "054-765-4321", "University friends", "Friends", "Groom", "1", "0", "yes", "", ""],
];
