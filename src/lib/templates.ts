import type { L10n, Palette, TemplateId, WeddingStyle } from "./types";
import { contrastRatio, l10n, luminance, mixHex } from "./utils";

export type ParticleKind = "gold" | "petals" | "leaves" | "sparkle" | "dust" | "none";

export interface TemplateDef {
  id: TemplateId;
  name: L10n;
  tagline: L10n;
  description: L10n;
  /** Curated palettes. The first one is the default. */
  palettes: Palette[];
  particles: ParticleKind;
  /** Wedding styles this design suits, strongest match first. */
  bestFor: WeddingStyle[];
  /** Uses the couple's first photo inside the card itself. */
  usesPhoto: boolean;
}

const p = (
  id: string,
  en: string,
  he: string,
  bg: string,
  ink: string,
  accent: string,
  soft: string,
  accent2?: string,
): Palette => ({ id, name: l10n(en, he), bg, ink, accent, soft, ...(accent2 ? { accent2 } : {}) });

export const TEMPLATES: TemplateDef[] = [
  {
    id: "classic",
    name: l10n("Classic Luxury", "קלאסי יוקרתי"),
    tagline: l10n("Engraved elegance, timeless proportions", "אלגנטיות חרוטה בפרופורציות על־זמניות"),
    description: l10n(
      "A double gold frame, a hand-set monogram and formal serif typography, the way invitations have been set for a century.",
      "מסגרת זהב כפולה, מונוגרמה וטיפוגרפיה סריפית חגיגית — כמו שהזמנות נכתבות כבר מאה שנה.",
    ),
    palettes: [
      p("ivory-gold", "Ivory & Gold", "שנהב וזהב", "#fbf7ef", "#2a241c", "#a8843f", "#f1e8d8"),
      p("blush-rose", "Blush & Rose Gold", "סומק ורוז גולד", "#fbf3ef", "#3a2a28", "#b4776a", "#f3e3dc"),
      p("sage-cream", "Sage & Cream", "מרווה ושמנת", "#f6f5ec", "#26301f", "#7c8b62", "#e6e9d8"),
    ],
    particles: "gold",
    bestFor: ["classic", "glamorous", "romantic"],
    usesPhoto: false,
  },
  {
    id: "minimal",
    name: l10n("Modern Minimal", "מודרני מינימליסטי"),
    tagline: l10n("Space, type and nothing else", "חלל, טיפוגרפיה ותו לא"),
    description: l10n(
      "Oversized numerals, generous white space and a single hairline. Confident and quiet.",
      "ספרות גדולות, הרבה אוויר וקו דק אחד. בטוח בעצמו ושקט.",
    ),
    palettes: [
      p("paper-white", "Paper White", "לבן נייר", "#ffffff", "#111111", "#111111", "#f2f0ec"),
      p("stone", "Warm Stone", "אבן חמה", "#f1eee9", "#1c1b19", "#8a7f72", "#e4dfd7"),
      p("night", "Night", "לילה", "#121212", "#f4f1ec", "#c9b796", "#1e1e1e"),
    ],
    particles: "none",
    bestFor: ["modern", "editorial", "classic"],
    usesPhoto: false,
  },
  {
    id: "garden",
    name: l10n("Romantic Garden", "גן רומנטי"),
    tagline: l10n("Botanicals that grow as you read", "צמחייה שצומחת תוך כדי קריאה"),
    description: l10n(
      "Hand-drawn eucalyptus and blossoms draw themselves around your names, with petals drifting past.",
      "ענפי אקליפטוס ופריחה מצוירים ביד נרקמים סביב השמות שלכם, ועלי כותרת מרחפים ברקע.",
    ),
    palettes: [
      p("blush-garden", "Blush Garden", "גן סומק", "#fbf4f0", "#3b3230", "#74876a", "#f2dfd8", "#d9a9a0"),
      p("lavender-dusk", "Lavender Dusk", "לבנדר בין ערביים", "#f7f4fa", "#2f2a3a", "#7d6fa0", "#e6def0", "#c3a9d6"),
      p("meadow", "Meadow", "אחו", "#f7f6ec", "#2b3324", "#6a8549", "#e3e8cc", "#e2b84e"),
    ],
    particles: "petals",
    bestFor: ["romantic", "classic", "mediterranean"],
    usesPhoto: false,
  },
  {
    id: "mediterranean",
    name: l10n("Mediterranean", "ים תיכוני"),
    tagline: l10n("Whitewash, cobalt and late sun", "סיד לבן, קובלט ושמש של אחר צהריים"),
    description: l10n(
      "An arched window onto the sea, olive branches and a tiled border, for weddings that smell of salt and lemon.",
      "חלון מקושת אל הים, ענפי זית ושוליים של אריחים — לחתונות עם ריח של מלח ולימון.",
    ),
    palettes: [
      p("santorini", "Santorini", "סנטוריני", "#fdfcf8", "#1b2b4b", "#2f5da8", "#e3ebf6", "#e0a23a"),
      p("terracotta", "Terracotta", "טרקוטה", "#fbf5ec", "#3a2418", "#b9623a", "#f1dfcb", "#5f7a4c"),
      p("olive-grove", "Olive Grove", "כרם זיתים", "#f8f6ea", "#2a2f1e", "#66763a", "#e7e8cf", "#c28b3c"),
    ],
    particles: "leaves",
    bestFor: ["mediterranean", "romantic", "modern"],
    usesPhoto: false,
  },
  {
    id: "royal",
    name: l10n("Royal Gold", "זהב מלכותי"),
    tagline: l10n("Foil, velvet and a sense of occasion", "פויל, קטיפה ותחושת אירוע"),
    description: l10n(
      "Deep jewel tones with foil-stamped lettering, an Art Deco frame and a slow shimmer of gold.",
      "גווני אבני חן עמוקים עם אותיות בהטבעת זהב, מסגרת ארט דקו ונצנוץ איטי.",
    ),
    palettes: [
      p("emerald-gold", "Emerald & Gold", "אזמרגד וזהב", "#0e2a22", "#f3e9d2", "#d4b36a", "#153a2f"),
      p("midnight-gold", "Midnight & Gold", "חצות וזהב", "#0f1830", "#f1e8d3", "#d8ba78", "#17233f"),
      p("burgundy-gold", "Burgundy & Gold", "בורדו וזהב", "#3a0f1c", "#f5e7d6", "#ddbb7a", "#4a1626"),
      p("noir-gold", "Noir & Gold", "שחור וזהב", "#121110", "#f0e6d2", "#cfae6b", "#1d1b18"),
    ],
    particles: "sparkle",
    bestFor: ["glamorous", "classic", "editorial"],
    usesPhoto: false,
  },
  {
    id: "editorial",
    name: l10n("Editorial Black & White", "אדיטוריאל שחור־לבן"),
    tagline: l10n("Your wedding, as a magazine cover", "החתונה שלכם, כמו שער של מגזין"),
    description: l10n(
      "A full-bleed monochrome photograph, a masthead and headline type that fills the page.",
      "צילום מונוכרומטי על כל העמוד, לוגו מגזין וכותרת שממלאת את השער.",
    ),
    palettes: [
      p("black-white", "Black & White", "שחור ולבן", "#0c0c0c", "#f7f5f1", "#f7f5f1", "#1a1a1a"),
      p("white-black", "White & Black", "לבן ושחור", "#fafaf7", "#0c0c0c", "#0c0c0c", "#eceae5"),
      p("newsprint", "Newsprint", "נייר עיתון", "#efebe2", "#1a1814", "#b3392c", "#e2dccf"),
    ],
    particles: "dust",
    bestFor: ["editorial", "modern", "glamorous"],
    usesPhoto: true,
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

export const isTemplateId = (v: unknown): v is TemplateId =>
  typeof v === "string" && (TEMPLATE_IDS as string[]).includes(v);

export function getTemplate(id: TemplateId | string | undefined | null): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const defaultPalette = (id: TemplateId): Palette => getTemplate(id).palettes[0];

export const isDarkPalette = (palette: Palette): boolean => luminance(palette.bg) < 0.2;

/** Every colour a card needs, derived from the four stored palette colours. */
export interface ResolvedPalette {
  bg: string;
  ink: string;
  accent: string;
  accent2: string;
  soft: string;
  /** Accent adjusted until it is readable as small text on the paper. */
  accentText: string;
  muted: string;
  line: string;
  dark: boolean;
  foil: string;
}

export function resolvePalette(palette: Palette): ResolvedPalette {
  const dark = isDarkPalette(palette);
  const accent2 = palette.accent2 ?? mixHex(palette.accent, palette.soft, 0.45);
  let accentText = palette.accent;
  // Walk the accent towards the ink until it reaches AA contrast for small text.
  for (let i = 0; i < 10 && contrastRatio(accentText, palette.bg) < 4.5; i++) {
    accentText = mixHex(accentText, palette.ink, 0.18);
  }
  const hi = mixHex(palette.accent, "#ffffff", dark ? 0.5 : 0.38);
  const lo = mixHex(palette.accent, "#000000", dark ? 0.18 : 0.3);
  return {
    bg: palette.bg,
    ink: palette.ink,
    accent: palette.accent,
    accent2,
    soft: palette.soft,
    accentText,
    muted: mixHex(palette.ink, palette.bg, 0.32),
    line: mixHex(palette.ink, palette.bg, 0.84),
    dark,
    foil: `linear-gradient(105deg, ${lo} 0%, ${hi} 28%, ${palette.accent} 50%, ${hi} 72%, ${lo} 100%)`,
  };
}

/** CSS custom properties for a card or a themed page section. */
export function paletteVars(palette: Palette): Record<string, string> {
  const r = resolvePalette(palette);
  return {
    "--inv-bg": r.bg,
    "--inv-ink": r.ink,
    "--inv-accent": r.accent,
    "--inv-accent2": r.accent2,
    "--inv-soft": r.soft,
    "--inv-accent-text": r.accentText,
    "--inv-muted": r.muted,
    "--inv-line": r.line,
    "--inv-foil": r.foil,
  };
}

/* ───────────────────────── Wedding styles & colour families ───────────────────────── */

export const WEDDING_STYLES: { id: WeddingStyle; name: L10n; hint: L10n }[] = [
  { id: "classic", name: l10n("Classic", "קלאסי"), hint: l10n("Formal, timeless, black tie", "חגיגי, על־זמני, רשמי") },
  { id: "modern", name: l10n("Modern", "מודרני"), hint: l10n("Clean lines, city light", "קווים נקיים, אור עירוני") },
  { id: "romantic", name: l10n("Romantic", "רומנטי"), hint: l10n("Flowers, candles, soft light", "פרחים, נרות, אור רך") },
  { id: "mediterranean", name: l10n("Mediterranean", "ים תיכוני"), hint: l10n("Sea, olive trees, long tables", "ים, עצי זית, שולחנות ארוכים") },
  { id: "glamorous", name: l10n("Glamorous", "זוהר"), hint: l10n("Gold, velvet, a grand entrance", "זהב, קטיפה, כניסה מרשימה") },
  { id: "editorial", name: l10n("Editorial", "אדיטוריאל"), hint: l10n("Fashion-forward, black & white", "אופנתי, שחור־לבן") },
];

export interface ColorFamily {
  id: string;
  name: L10n;
  swatch: string;
  light: Palette;
  dark: Palette;
}

/** Preferred-colour chips in the wizard. Each maps to a light and a dark palette. */
export const COLOR_FAMILIES: ColorFamily[] = [
  {
    id: "gold",
    name: l10n("Gold", "זהב"),
    swatch: "#b08d57",
    light: p("ai-gold-light", "Champagne Gold", "זהב שמפניה", "#fbf7ef", "#2a241c", "#a8843f", "#f1e8d8"),
    dark: p("ai-gold-dark", "Noir & Gold", "שחור וזהב", "#121110", "#f0e6d2", "#cfae6b", "#1d1b18"),
  },
  {
    id: "blush",
    name: l10n("Blush", "סומק"),
    swatch: "#d9a9a0",
    light: p("ai-blush-light", "Blush & Rose Gold", "סומק ורוז גולד", "#fbf3ef", "#3a2a28", "#b4776a", "#f3e3dc", "#d9a9a0"),
    dark: p("ai-blush-dark", "Rosewood", "עץ ורד", "#2b1a1c", "#f6e7e1", "#dba99c", "#3a2427"),
  },
  {
    id: "sage",
    name: l10n("Sage", "מרווה"),
    swatch: "#8a9a78",
    light: p("ai-sage-light", "Sage & Cream", "מרווה ושמנת", "#f6f5ec", "#26301f", "#70825a", "#e6e9d8", "#d9b38a"),
    dark: p("ai-sage-dark", "Forest", "יער", "#17231b", "#edf0e2", "#a9bb8f", "#203026"),
  },
  {
    id: "blue",
    name: l10n("Blue", "כחול"),
    swatch: "#2f5da8",
    light: p("ai-blue-light", "Aegean", "אגאי", "#fdfcf8", "#1b2b4b", "#2f5da8", "#e3ebf6", "#e0a23a"),
    dark: p("ai-blue-dark", "Midnight & Gold", "חצות וזהב", "#0f1830", "#f1e8d3", "#d8ba78", "#17233f"),
  },
  {
    id: "burgundy",
    name: l10n("Burgundy", "בורדו"),
    swatch: "#7a1f33",
    light: p("ai-burgundy-light", "Mulberry", "תות עץ", "#fbf4f1", "#3a1420", "#8d2a40", "#f2dfdf"),
    dark: p("ai-burgundy-dark", "Burgundy & Gold", "בורדו וזהב", "#3a0f1c", "#f5e7d6", "#ddbb7a", "#4a1626"),
  },
  {
    id: "terracotta",
    name: l10n("Terracotta", "טרקוטה"),
    swatch: "#b9623a",
    light: p("ai-terracotta-light", "Terracotta", "טרקוטה", "#fbf5ec", "#3a2418", "#b9623a", "#f1dfcb", "#5f7a4c"),
    dark: p("ai-terracotta-dark", "Ember", "גחלת", "#2a1810", "#f6e8d8", "#e09a6c", "#3a2216"),
  },
  {
    id: "lavender",
    name: l10n("Lavender", "לבנדר"),
    swatch: "#9a8cc0",
    light: p("ai-lavender-light", "Lavender Dusk", "לבנדר בין ערביים", "#f7f4fa", "#2f2a3a", "#7d6fa0", "#e6def0", "#c3a9d6"),
    dark: p("ai-lavender-dark", "Violet Night", "ליל סגול", "#1d1a2b", "#efeaf7", "#b8a8dc", "#29243b"),
  },
  {
    id: "emerald",
    name: l10n("Emerald", "אזמרגד"),
    swatch: "#17624e",
    light: p("ai-emerald-light", "Garden Green", "ירוק גן", "#f6f7f0", "#12332a", "#1f6b55", "#dfeadf", "#c9a45a"),
    dark: p("ai-emerald-dark", "Emerald & Gold", "אזמרגד וזהב", "#0e2a22", "#f3e9d2", "#d4b36a", "#153a2f"),
  },
  {
    id: "black",
    name: l10n("Black & White", "שחור־לבן"),
    swatch: "#111111",
    light: p("ai-mono-light", "Paper White", "לבן נייר", "#ffffff", "#111111", "#111111", "#f2f0ec"),
    dark: p("ai-mono-dark", "Black & White", "שחור ולבן", "#0c0c0c", "#f7f5f1", "#f7f5f1", "#1a1a1a"),
  },
  {
    id: "ivory",
    name: l10n("Ivory", "שנהב"),
    swatch: "#efe6d6",
    light: p("ai-ivory-light", "Warm Stone", "אבן חמה", "#f4f0e8", "#24201b", "#8a7a63", "#e7dfd1"),
    dark: p("ai-ivory-dark", "Espresso", "אספרסו", "#221c17", "#f2eadc", "#cdb898", "#2e2620"),
  },
];
