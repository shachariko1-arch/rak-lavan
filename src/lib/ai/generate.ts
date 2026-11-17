import { COLOR_FAMILIES, TEMPLATES, getTemplate, isTemplateId } from "../templates";
import type { InviteText, L10n, Locale, Palette, TemplateId, WeddingStyle } from "../types";
import { formatWeddingDate, isHexColor, l10n } from "../utils";

/** What the creation wizard knows about the couple. Photos never leave the browser. */
export interface AiInput {
  bride: string;
  groom: string;
  date: string;
  receptionTime: string;
  ceremonyTime: string;
  venue: string;
  address: string;
  style: WeddingStyle;
  colors: string[];
  message: string;
  photoCount: number;
  language: Locale;
}

export interface AiVariant {
  id: string;
  tone: L10n;
  text: { en: InviteText; he: InviteText };
}

export interface AiResult {
  /** "claude" when the Claude API wrote it, "local" for the built-in composer. */
  source: "claude" | "local";
  variants: AiVariant[];
  intros: L10n[];
  templates: { id: TemplateId; score: number; reason: L10n }[];
  palettes: Palette[];
}

const STYLE_FIT: Record<WeddingStyle, TemplateId[]> = {
  classic: ["classic", "royal", "garden", "minimal", "mediterranean", "editorial"],
  modern: ["minimal", "editorial", "classic", "mediterranean", "royal", "garden"],
  romantic: ["garden", "classic", "mediterranean", "royal", "minimal", "editorial"],
  mediterranean: ["mediterranean", "garden", "minimal", "classic", "editorial", "royal"],
  glamorous: ["royal", "classic", "editorial", "minimal", "garden", "mediterranean"],
  editorial: ["editorial", "minimal", "royal", "classic", "mediterranean", "garden"],
};

const COLOR_FIT: Record<string, TemplateId[]> = {
  gold: ["classic", "royal"],
  blush: ["garden", "classic"],
  sage: ["garden", "classic"],
  blue: ["mediterranean", "royal"],
  burgundy: ["royal"],
  terracotta: ["mediterranean"],
  lavender: ["garden"],
  emerald: ["royal", "garden"],
  black: ["editorial", "minimal"],
  ivory: ["classic", "minimal"],
};

const REASONS: Record<TemplateId, L10n> = {
  classic: l10n("Formal proportions and a gold frame suit a celebration that wants to feel timeless.", "פרופורציות חגיגיות ומסגרת זהב מתאימות לאירוע שרוצה להרגיש על־זמני."),
  minimal: l10n("Your taste for clean lines calls for space, a large date and nothing unnecessary.", "הטעם שלכם לקווים נקיים מבקש אוויר, תאריך גדול ושום דבר מיותר."),
  garden: l10n("Soft botanicals and drifting petals echo a romantic day surrounded by flowers.", "צמחייה רכה ועלי כותרת מרחפים מהדהדים יום רומנטי מוקף פרחים."),
  mediterranean: l10n("Sea, sun and olive branches set the tone for long tables and late light.", "ים, שמש וענפי זית נותנים את הטון לשולחנות ארוכים ולאור של אחר צהריים."),
  royal: l10n("Deep colour and foil lettering give the evening the sense of occasion you described.", "צבע עמוק ואותיות בהטבעת זהב נותנים לערב את תחושת האירוע שתיארתם."),
  editorial: l10n("Your photograph becomes the cover, with headline type doing the talking.", "הצילום שלכם הופך לשער, והכותרת עושה את כל העבודה."),
};

export function rankTemplates(input: Pick<AiInput, "style" | "colors" | "photoCount">): AiResult["templates"] {
  const order = STYLE_FIT[input.style] ?? STYLE_FIT.classic;
  return TEMPLATES.map((t) => {
    let score = 96 - order.indexOf(t.id) * 9;
    for (const colour of input.colors) if (COLOR_FIT[colour]?.includes(t.id)) score += 5;
    if (t.usesPhoto) score += input.photoCount > 0 ? 6 : -8;
    return { id: t.id, score: Math.max(40, Math.min(99, score)), reason: REASONS[t.id] };
  }).sort((a, b) => b.score - a.score);
}

export function suggestPalettes(input: Pick<AiInput, "style" | "colors">, best: TemplateId): Palette[] {
  const preferDark = input.style === "glamorous" || best === "royal";
  const picked = COLOR_FAMILIES.filter((f) => input.colors.includes(f.id));
  const out: Palette[] = [];
  for (const family of picked) out.push(preferDark ? family.dark : family.light);
  for (const family of picked) out.push(preferDark ? family.light : family.dark);
  for (const p of getTemplate(best).palettes) out.push(p);
  const seen = new Set<string>();
  return out.filter((p) => !seen.has(p.bg + p.accent) && seen.add(p.bg + p.accent)).slice(0, 5);
}

const text = (opening: string, invitation: string, closing: string): InviteText => ({ opening, invitation, closing });

function meal(time: string): { en: string; he: string } {
  const hour = Number(time.split(":")[0]);
  if (hour < 15) return { en: "Lunch, dancing and a long afternoon to follow", he: "ארוחת צהריים, ריקודים ואחר צהריים ארוך" };
  return { en: "Dinner and dancing to follow", he: "ארוחת ערב וריקודים עד הלילה" };
}

/** Built-in composer. Deterministic, bilingual, and good enough to publish as is. */
export function generateLocally(input: AiInput): AiResult {
  const { bride, groom, venue } = input;
  const after = meal(input.receptionTime || "19:00");
  const monthEn = input.date ? formatWeddingDate(input.date, "en", "monthYear") : "";
  const monthHe = input.date ? formatWeddingDate(input.date, "he", "monthYear") : "";
  const own = input.message.trim();

  const variants: AiVariant[] = [
    {
      id: "classic",
      tone: l10n("Classic & formal", "קלאסי וחגיגי"),
      text: {
        en: text("Together with their families", "request the pleasure of your company at their wedding", after.en),
        he: text("בשמחה ובהתרגשות, יחד עם משפחותיהם", "מתכבדים להזמינכם לחגוג עמם את יום נישואיהם", "נשמח לראותכם בין אורחינו"),
      },
    },
    {
      id: "modern",
      tone: l10n("Modern & simple", "מודרני ופשוט"),
      text: {
        en: text("We are getting married", "and we would love you to be there", "Come hungry. Stay late."),
        he: text("אנחנו מתחתנים", "ונשמח מאוד שתהיו שם איתנו", "בואו רעבים. הישארו עד מאוחר."),
      },
    },
    {
      id: "warm",
      tone: l10n("Warm & personal", "חם ואישי"),
      text: {
        en: text("With joy in our hearts", "invite you to share the happiest day of their lives", "Your presence is the only gift we wish for"),
        he: text("בלב מלא שמחה", "מזמינים אתכם להיות חלק מהיום המאושר בחייהם", "הנוכחות שלכם היא המתנה הכי יפה"),
      },
    },
  ];

  const intros: L10n[] = [
    l10n(
      `${own ? `${own} ` : ""}${monthEn ? `This ${monthEn.split(" ")[0]}, ` : ""}${bride} and ${groom} are getting married${venue ? ` at ${venue}` : ""}, and the day would not be complete without the people who made them who they are. That means you.`,
      `${own ? `${own} ` : ""}${monthHe ? `ב${monthHe.split(" ")[0]} הקרוב ` : ""}${bride} ו${groom} מתחתנים${venue ? ` ב״${venue}״` : ""}, והיום הזה לא יהיה שלם בלי האנשים שהפכו אותם למי שהם. כלומר, אתם.`,
    ),
    l10n(
      `Some stories begin quietly and then change everything. ${bride} and ${groom} are writing the next chapter of theirs, and they are saving you a seat${venue ? ` at ${venue}` : ""}.`,
      `יש סיפורים שמתחילים בשקט ומשנים הכול. ${bride} ו${groom} כותבים את הפרק הבא שלהם, ושומרים לכם מקום${venue ? ` ב״${venue}״` : ""}.`,
    ),
    l10n(
      `One day, one promise, and everyone ${bride} and ${groom} love in a single place. Come celebrate, raise a glass and dance until your shoes come off.`,
      `יום אחד, הבטחה אחת, וכל מי ש${bride} ו${groom} אוהבים במקום אחד. בואו לחגוג, להרים כוסית ולרקוד עד שהנעליים יורדות.`,
    ),
  ];

  const templates = rankTemplates(input);
  return { source: "local", variants, intros, templates, palettes: suggestPalettes(input, templates[0].id) };
}

const cleanText = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Validates model output field by field; anything malformed falls back to the local result. */
export function mergeModelOutput(raw: unknown, input: AiInput): AiResult {
  const base = generateLocally(input);
  const data = (raw ?? {}) as Record<string, unknown>;
  const result: AiResult = { ...base, source: "claude" };

  const inviteText = (v: unknown): InviteText | null => {
    const t = (v ?? {}) as Record<string, unknown>;
    const out = text(cleanText(t.opening, 90), cleanText(t.invitation, 120), cleanText(t.closing, 90));
    return out.opening && out.invitation ? out : null;
  };

  if (Array.isArray(data.variants)) {
    const variants = data.variants
      .map((v, i): AiVariant | null => {
        const item = (v ?? {}) as Record<string, unknown>;
        const en = inviteText(item.en);
        const he = inviteText(item.he);
        if (!en || !he) return null;
        return { id: `ai-${i}`, tone: l10n(cleanText(item.tone_en, 40) || `Option ${i + 1}`, cleanText(item.tone_he, 40) || `אפשרות ${i + 1}`), text: { en, he } };
      })
      .filter((v): v is AiVariant => v !== null);
    if (variants.length) result.variants = variants.slice(0, 4);
  }

  if (Array.isArray(data.intros)) {
    const intros = data.intros
      .map((v) => {
        const item = (v ?? {}) as Record<string, unknown>;
        return l10n(cleanText(item.en, 420), cleanText(item.he, 420));
      })
      .filter((v) => v.en && v.he);
    if (intros.length) result.intros = intros.slice(0, 4);
  }

  if (Array.isArray(data.templates)) {
    const seen = new Set<string>();
    const ranked = data.templates
      .map((v) => {
        const item = (v ?? {}) as Record<string, unknown>;
        if (!isTemplateId(item.id) || seen.has(item.id)) return null;
        seen.add(item.id);
        const score = Math.max(40, Math.min(99, Number(item.score) || 70));
        return { id: item.id, score, reason: l10n(cleanText(item.reason_en, 220) || REASONS[item.id].en, cleanText(item.reason_he, 220) || REASONS[item.id].he) };
      })
      .filter((v): v is AiResult["templates"][number] => v !== null);
    if (ranked.length) {
      const rest = base.templates.filter((t) => !seen.has(t.id)).map((t) => ({ ...t, score: Math.min(t.score, 60) }));
      result.templates = [...ranked, ...rest].sort((a, b) => b.score - a.score);
    }
  }

  if (Array.isArray(data.palettes)) {
    const palettes = data.palettes
      .map((v, i): Palette | null => {
        const item = (v ?? {}) as Record<string, unknown>;
        if (![item.bg, item.ink, item.accent, item.soft].every(isHexColor)) return null;
        return {
          id: `ai-palette-${i}`,
          name: l10n(cleanText(item.name_en, 32) || `Palette ${i + 1}`, cleanText(item.name_he, 32) || `פלטה ${i + 1}`),
          bg: item.bg as string,
          ink: item.ink as string,
          accent: item.accent as string,
          soft: item.soft as string,
          ...(isHexColor(item.accent2) ? { accent2: item.accent2 } : {}),
        };
      })
      .filter((v): v is Palette => v !== null);
    if (palettes.length) result.palettes = [...palettes, ...base.palettes].slice(0, 6);
  }
  return result;
}

export const AI_LIMITS = { name: 40, venue: 80, address: 140, message: 600 } as const;

/** Clamps and normalises a request body from the wizard. Returns null when unusable. */
export function parseAiInput(body: unknown): AiInput | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const bride = cleanText(b.bride, AI_LIMITS.name);
  const groom = cleanText(b.groom, AI_LIMITS.name);
  if (!bride || !groom) return null;
  const style = (Object.keys(STYLE_FIT) as WeddingStyle[]).find((s) => s === b.style) ?? "classic";
  const time = (v: unknown, fallback: string) => (typeof v === "string" && /^\d{2}:\d{2}$/.test(v) ? v : fallback);
  return {
    bride,
    groom,
    date: typeof b.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : "",
    receptionTime: time(b.receptionTime, "19:00"),
    ceremonyTime: time(b.ceremonyTime, "20:00"),
    venue: cleanText(b.venue, AI_LIMITS.venue),
    address: cleanText(b.address, AI_LIMITS.address),
    style,
    colors: Array.isArray(b.colors) ? b.colors.filter((c): c is string => typeof c === "string" && c in COLOR_FIT).slice(0, 4) : [],
    message: cleanText(b.message, AI_LIMITS.message),
    photoCount: Math.max(0, Math.min(12, Number(b.photoCount) || 0)),
    language: b.language === "he" ? "he" : "en",
  };
}
