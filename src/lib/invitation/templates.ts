import type { Locale } from "@/lib/i18n/config";
import { SECTION_IDS, type InvitationDesign, type SectionId } from "./schema";

export const TEMPLATE_CATEGORIES = [
  "luxury",
  "minimal",
  "romantic",
  "botanical",
  "modern",
  "classic",
  "mediterranean",
  "traditional",
  "editorial",
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TemplateCategory, { en: string; he: string }> = {
  luxury: { en: "Luxury", he: "יוקרה" },
  minimal: { en: "Minimal", he: "מינימליסטי" },
  romantic: { en: "Romantic", he: "רומנטי" },
  botanical: { en: "Botanical", he: "בוטני" },
  modern: { en: "Modern", he: "מודרני" },
  classic: { en: "Classic", he: "קלאסי" },
  mediterranean: { en: "Mediterranean", he: "ים תיכוני" },
  traditional: { en: "Traditional", he: "מסורתי" },
  editorial: { en: "Editorial", he: "מגזיני" },
};

type Content = InvitationDesign["content"];
type DesignBase = Omit<InvitationDesign, "content" | "language" | "templateSlug" | "version">;

export type TemplateDefinition = {
  slug: string;
  name: { en: string; he: string };
  tagline: { en: string; he: string };
  description: { en: string; he: string };
  category: TemplateCategory;
  tags: TemplateCategory[];
  palette: string[];
  premium: boolean;
  base: DesignBase;
  content: Record<Locale, Content>;
};

const ALL_SECTIONS = (hidden: SectionId[] = []) =>
  SECTION_IDS.map((id) => ({ id, visible: !hidden.includes(id) }));

const RSVP_DEFAULTS: DesignBase["rsvp"] = {
  enabled: true,
  deadline: null,
  defaultMaxAttendees: 2,
  allowUpdates: true,
  askDietary: true,
  askMessage: true,
  askCompanionNames: true,
};

const NO_MEDIA = {
  photos: { hero: null, gallery: [] },
  music: { enabled: false, url: null, title: null },
};

const CONTENT_EN: Content = {
  eyebrow: "Together with their families",
  headline: "You're invited to our wedding",
  intro:
    "With joy in our hearts, we invite you to celebrate the beginning of our forever. Your presence would mean the world to us.",
  eventDetails: "",
  closing: "With love",
  rsvpPrompt: "Kindly confirm your attendance",
};

const CONTENT_HE: Content = {
  eyebrow: "יחד עם משפחותינו",
  headline: "שמחים להזמינכם לחתונתנו",
  intro: "בלב מלא אהבה ושמחה, אנו מתכבדים להזמינכם לחגוג איתנו את תחילתו של פרק חדש. נוכחותכם תשמח אותנו מאוד.",
  eventDetails: "",
  closing: "באהבה",
  rsvpPrompt: "נשמח לדעת אם תגיעו",
};

export const TEMPLATES: TemplateDefinition[] = [
  {
    slug: "midnight-elegance",
    name: { en: "Midnight Elegance", he: "אלגנטיות של חצות" },
    tagline: { en: "Black & champagne gold", he: "שחור וזהב שמפניה" },
    description: {
      en: "A cinematic night-black canvas, champagne-gold hairlines and an elegant serif — for evenings that glow.",
      he: "קנבס שחור קולנועי, קווי זהב שמפניה עדינים וטיפוגרפיה סריפית — לערבים שזוהרים.",
    },
    category: "luxury",
    tags: ["luxury", "classic", "modern"],
    palette: ["#0B0B0F", "#16161C", "#D9B98B", "#F4EFE6"],
    premium: false,
    base: {
      layout: { variant: "framed", alignment: "center", spacing: "airy", imagePlacement: "inline", sections: ALL_SECTIONS() },
      typography: { pairing: "editorial", scale: 1.05, headingWeight: 400, lineHeight: 1.6, letterSpacing: 0.02, nameStyle: "upright" },
      colors: {
        background: "#0b0b0f",
        surface: "#16161c",
        text: "#f4efe6",
        textSecondary: "#b8b4ae",
        accent: "#d9b98b",
        button: "#d9b98b",
        buttonText: "#0b0b0f",
      },
      background: { kind: "texture", gradient: { from: "#0b0b0f", to: "#1b1c22", angle: 160 }, texture: "silk", imageUrl: null, videoUrl: null, overlay: 0.2 },
      ornament: "gold-frame",
      animation: { opening: "cinematic", particles: true },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "An evening of celebration", closing: "We can't wait to celebrate with you" },
      he: { ...CONTENT_HE, eyebrow: "ערב של חגיגה", closing: "מחכים לחגוג איתכם" },
    },
  },
  {
    slug: "botanical-romance",
    name: { en: "Botanical Romance", he: "רומנטיקה בוטנית" },
    tagline: { en: "Ivory & delicate flowers", he: "שנהב ופרחים עדינים" },
    description: {
      en: "Warm ivory paper, hand-drawn florals and romantic italic lettering that feels like a garden in bloom.",
      he: "נייר שנהב חם, פרחים מאוירים ביד ואותיות נטויות רומנטיות — כמו גן בפריחה.",
    },
    category: "botanical",
    tags: ["botanical", "romantic", "classic"],
    palette: ["#F6F1E7", "#FFFDF8", "#8A9A6B", "#3B3A33"],
    premium: false,
    base: {
      layout: { variant: "classic", alignment: "center", spacing: "airy", imagePlacement: "inline", sections: ALL_SECTIONS() },
      typography: { pairing: "romantic", scale: 1.1, headingWeight: 400, lineHeight: 1.65, letterSpacing: 0, nameStyle: "italic" },
      colors: {
        background: "#f6f1e7",
        surface: "#fffdf8",
        text: "#3b3a33",
        textSecondary: "#6f6b5f",
        accent: "#7d8c5f",
        button: "#3b3a33",
        buttonText: "#f6f1e7",
      },
      background: { kind: "texture", gradient: { from: "#f6f1e7", to: "#efe6d4", angle: 180 }, texture: "paper", imageUrl: null, videoUrl: null, overlay: 0 },
      ornament: "botanical",
      animation: { opening: "botanical", particles: false },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "Love is in bloom", intro: "Like a garden in spring, our love has grown into something beautiful. We would be honoured to have you with us as we say “I do”." },
      he: { ...CONTENT_HE, eyebrow: "האהבה פורחת", intro: "כמו גן באביב, האהבה שלנו צמחה למשהו יפה. נתכבד בנוכחותכם ברגע שבו נאמר “כן”." },
    },
  },
  {
    slug: "modern-minimal",
    name: { en: "Modern Minimal", he: "מינימליזם מודרני" },
    tagline: { en: "Clean white & simple type", he: "לבן נקי וטיפוגרפיה פשוטה" },
    description: {
      en: "Gallery-white space, precise geometry and confident sans-serif type. Quiet, architectural, timeless.",
      he: "לבן של גלריה, גאומטריה מדויקת וטיפוגרפיה נקייה. שקט, אדריכלי ונצחי.",
    },
    category: "minimal",
    tags: ["minimal", "modern"],
    palette: ["#FFFFFF", "#F4F4F2", "#111111", "#8C8C8C"],
    premium: false,
    base: {
      layout: { variant: "minimal", alignment: "start", spacing: "balanced", imagePlacement: "top", sections: ALL_SECTIONS(["closing"]) },
      typography: { pairing: "modern", scale: 0.95, headingWeight: 300, lineHeight: 1.55, letterSpacing: 0.06, nameStyle: "upright" },
      colors: {
        background: "#ffffff",
        surface: "#f4f4f2",
        text: "#111111",
        textSecondary: "#6b6b6b",
        accent: "#111111",
        button: "#111111",
        buttonText: "#ffffff",
      },
      background: { kind: "solid", gradient: { from: "#ffffff", to: "#f4f4f2", angle: 180 }, texture: "none", imageUrl: null, videoUrl: null, overlay: 0 },
      ornament: "geometric",
      animation: { opening: "fade", particles: false },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "Save the date", headline: "We're getting married", closing: "" },
      he: { ...CONTENT_HE, eyebrow: "שמרו את התאריך", headline: "אנחנו מתחתנים", closing: "" },
    },
  },
  {
    slug: "mediterranean-sunset",
    name: { en: "Mediterranean Sunset", he: "שקיעה ים תיכונית" },
    tagline: { en: "Ocean & warm sunset", he: "ים ושקיעה חמה" },
    description: {
      en: "Golden-hour skies over a calm sea, swaying palms and warm light — a seaside celebration in every detail.",
      he: "שמי שעת הזהב מעל ים רגוע, דקלים מתנועעים ואור חם — חגיגה על חוף הים בכל פרט.",
    },
    category: "mediterranean",
    tags: ["mediterranean", "romantic"],
    palette: ["#F2A981", "#E9C7A0", "#2E4A62", "#FFF8EE"],
    premium: false,
    base: {
      layout: { variant: "classic", alignment: "center", spacing: "balanced", imagePlacement: "background", sections: ALL_SECTIONS() },
      typography: { pairing: "editorial", scale: 1.1, headingWeight: 400, lineHeight: 1.6, letterSpacing: 0.01, nameStyle: "italic" },
      colors: {
        background: "#2a3f55",
        surface: "#fff8ee",
        text: "#fff8ee",
        textSecondary: "#f5dfc7",
        accent: "#f2c38b",
        button: "#fff8ee",
        buttonText: "#2a3f55",
      },
      background: { kind: "texture", gradient: { from: "#f2a981", to: "#2e4a62", angle: 180 }, texture: "sunset", imageUrl: null, videoUrl: null, overlay: 0.25 },
      ornament: "palms",
      animation: { opening: "slide", particles: false },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "By the sea, at golden hour", intro: "As the sun sets over the Mediterranean, we'll begin our forever. Join us for an evening of love, music and the sea breeze." },
      he: { ...CONTENT_HE, eyebrow: "על חוף הים, בשעת הזהב", intro: "כשהשמש שוקעת אל הים התיכון, נתחיל את הנצח שלנו. הצטרפו אלינו לערב של אהבה, מוזיקה ובריזה ימית." },
    },
  },
  {
    slug: "royal-champagne",
    name: { en: "Royal Champagne", he: "שמפניה מלכותית" },
    tagline: { en: "Cream & gold", he: "קרם וזהב" },
    description: {
      en: "Cream linen, a gilded double frame and stately serif lettering. Ceremony, grandeur and grace.",
      he: "פשתן בגוון קרם, מסגרת זהב כפולה ואותיות סריף מלכותיות. טקס, הדר וחן.",
    },
    category: "classic",
    tags: ["classic", "luxury", "traditional"],
    palette: ["#F3EBDD", "#FBF7EF", "#B99A70", "#2B2418"],
    premium: true,
    base: {
      layout: { variant: "framed", alignment: "center", spacing: "airy", imagePlacement: "inline", sections: ALL_SECTIONS() },
      typography: { pairing: "classic", scale: 1.05, headingWeight: 500, lineHeight: 1.6, letterSpacing: 0.03, nameStyle: "upright" },
      colors: {
        background: "#f3ebdd",
        surface: "#fbf7ef",
        text: "#2b2418",
        textSecondary: "#6a5b45",
        accent: "#a8875a",
        button: "#2b2418",
        buttonText: "#f3ebdd",
      },
      background: { kind: "texture", gradient: { from: "#f3ebdd", to: "#e8dcc6", angle: 180 }, texture: "linen", imageUrl: null, videoUrl: null, overlay: 0 },
      ornament: "gold-frame",
      animation: { opening: "envelope", particles: true },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "The honour of your presence is requested", closing: "With love and gratitude" },
      he: { ...CONTENT_HE, eyebrow: "נתכבד בנוכחותכם", closing: "באהבה ובהוקרה" },
    },
  },
  {
    slug: "editorial-romance",
    name: { en: "Editorial Romance", he: "רומנטיקה מגזינית" },
    tagline: { en: "Luxury wedding photography", he: "צילום חתונות יוקרתי" },
    description: {
      en: "Fashion-magazine composition built around your photography, with oversized italic names and quiet luxury.",
      he: "קומפוזיציה של מגזין אופנה סביב הצילומים שלכם, עם שמות נטויים גדולים ויוקרה שקטה.",
    },
    category: "editorial",
    tags: ["editorial", "modern", "luxury"],
    palette: ["#1A1714", "#2A2520", "#E8D2B0", "#F7F4EF"],
    premium: true,
    base: {
      layout: { variant: "editorial", alignment: "start", spacing: "balanced", imagePlacement: "background", sections: ALL_SECTIONS() },
      typography: { pairing: "editorial", scale: 1.2, headingWeight: 300, lineHeight: 1.55, letterSpacing: 0, nameStyle: "italic" },
      colors: {
        background: "#1a1714",
        surface: "#2a2520",
        text: "#f7f4ef",
        textSecondary: "#cfc6b8",
        accent: "#e8d2b0",
        button: "#f7f4ef",
        buttonText: "#1a1714",
      },
      background: { kind: "texture", gradient: { from: "#1a1714", to: "#3a2f26", angle: 200 }, texture: "bokeh", imageUrl: null, videoUrl: null, overlay: 0.35 },
      ornament: "none",
      animation: { opening: "paper", particles: false },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "Issue No. 01 — The Wedding", headline: "Our love story, next chapter", closing: "See you on the dance floor" },
      he: { ...CONTENT_HE, eyebrow: "גיליון 01 — החתונה", headline: "סיפור האהבה שלנו, הפרק הבא", closing: "נתראה על רחבת הריקודים" },
    },
  },
  {
    slug: "jerusalem-stone",
    name: { en: "Jerusalem Stone", he: "אבן ירושלמית" },
    tagline: { en: "Warm limestone & olive branches", he: "אבן גיר חמה וענפי זית" },
    description: {
      en: "Sun-warmed limestone, olive branches and Frank Ruhl lettering — a traditional invitation with soul.",
      he: "אבן גיר חמימה, ענפי זית ואותיות פרנק־ריהל — הזמנה מסורתית עם נשמה.",
    },
    category: "traditional",
    tags: ["traditional", "classic", "romantic"],
    palette: ["#EFE6D6", "#F8F3EA", "#A07D4F", "#3A3128"],
    premium: false,
    base: {
      layout: { variant: "classic", alignment: "center", spacing: "balanced", imagePlacement: "inline", sections: ALL_SECTIONS() },
      typography: { pairing: "heritage", scale: 1, headingWeight: 500, lineHeight: 1.7, letterSpacing: 0, nameStyle: "upright" },
      colors: {
        background: "#efe6d6",
        surface: "#f8f3ea",
        text: "#3a3128",
        textSecondary: "#6e5f4d",
        accent: "#957347",
        button: "#3a3128",
        buttonText: "#f8f3ea",
      },
      background: { kind: "texture", gradient: { from: "#efe6d6", to: "#e3d5bd", angle: 180 }, texture: "stone", imageUrl: null, videoUrl: null, overlay: 0 },
      ornament: "olive",
      animation: { opening: "envelope", particles: false },
      rsvp: RSVP_DEFAULTS,
      ...NO_MEDIA,
    },
    content: {
      en: { ...CONTENT_EN, eyebrow: "With gratitude to God and our families", closing: "With love and joy" },
      he: { ...CONTENT_HE, eyebrow: "בשמחה ובהודיה לבורא עולם", intro: "ברוב שמחה ובלב מלא הודיה, אנו מתכבדים להזמינכם להשתתף בשמחת נישואינו.", closing: "בברכה ובאהבה" },
    },
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.slug, t])) as Record<string, TemplateDefinition>;

export function getTemplate(slug: string): TemplateDefinition | undefined {
  return TEMPLATE_MAP[slug];
}

/** Build a complete, valid design document from a template. */
export function designFromTemplate(template: TemplateDefinition, language: Locale): InvitationDesign {
  return structuredClone({
    version: 1 as const,
    templateSlug: template.slug,
    language,
    ...template.base,
    content: template.content[language],
  });
}

/** Swap template look while keeping the couple's content, photos, music and RSVP settings. */
export function applyTemplate(current: InvitationDesign, template: TemplateDefinition): InvitationDesign {
  const fresh = designFromTemplate(template, current.language);
  return {
    ...fresh,
    content: current.content,
    photos: current.photos,
    music: current.music,
    rsvp: current.rsvp,
  };
}
