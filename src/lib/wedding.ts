import { DEFAULT_MESSAGE_TEMPLATES } from "./messaging/templates";
import { defaultPalette } from "./templates";
import type { Locale, Palette, Wedding } from "./types";
import { contrastRatio, l10n, luminance, mixHex, uuid } from "./utils";

/** A blank wedding for the creation wizard. Pure: the id and timestamp are assigned in the browser. */
export function emptyWedding(language: Locale): Wedding {
  return {
    id: "",
    slug: "",
    ownerId: "",
    bride: l10n(""),
    groom: l10n(""),
    brideLast: l10n(""),
    groomLast: l10n(""),
    date: "",
    receptionTime: "19:00",
    ceremonyTime: "20:00",
    venue: l10n(""),
    address: l10n(""),
    language,
    style: "classic",
    colors: [],
    templateId: "classic",
    palette: defaultPalette("classic"),
    text: {
      en: { opening: "Together with their families", invitation: "invite you to celebrate their wedding", closing: "" },
      he: { opening: "בשמחה ובהתרגשות", invitation: "מזמינים אתכם לחגוג עמם את יום נישואיהם", closing: "" },
    },
    intro: l10n(""),
    personalMessage: "",
    photos: [],
    rsvpDeadline: null,
    allowOpenRsvp: true,
    messageTemplates: DEFAULT_MESSAGE_TEMPLATES,
    createdAt: "",
  };
}

export const withIdentity = (w: Wedding): Wedding =>
  w.id ? w : { ...w, id: uuid(), createdAt: new Date().toISOString() };

/** Builds a readable palette from colours found in a photo. */
export function paletteFromColors(colors: string[]): Palette | null {
  if (colors.length < 2) return null;
  const byLight = [...colors].sort((a, b) => luminance(b) - luminance(a));
  const bg = mixHex(byLight[0], "#ffffff", 0.82);
  const ink = mixHex(byLight[byLight.length - 1], "#000000", 0.55);
  const saturation = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return Math.max(...c) - Math.min(...c);
  };
  let accent = [...colors].sort((a, b) => saturation(b) - saturation(a))[0];
  for (let i = 0; i < 8 && contrastRatio(accent, bg) < 3; i++) accent = mixHex(accent, ink, 0.2);
  return {
    id: "from-photo",
    name: l10n("From your photo", "מהתמונה שלכם"),
    bg,
    ink,
    accent,
    accent2: mixHex(accent, bg, 0.45),
    soft: mixHex(bg, accent, 0.12),
  };
}
