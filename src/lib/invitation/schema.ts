import { z } from "zod";

/**
 * The invitation design schema.
 *
 * Every invitation — template defaults, AI concepts, the editor draft and the
 * published snapshot — is one of these validated documents. Nothing outside
 * this schema is ever rendered, so AI output and editor state can never inject
 * arbitrary markup, CSS or code.
 */

export const SECTION_IDS = [
  "names",
  "photo",
  "intro",
  "date",
  "countdown",
  "schedule",
  "venue",
  "gallery",
  "rsvp",
  "closing",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const FONT_PAIRINGS = ["editorial", "romantic", "modern", "heritage", "classic"] as const;
export type FontPairingId = (typeof FONT_PAIRINGS)[number];

export const LAYOUT_VARIANTS = ["classic", "editorial", "framed", "minimal"] as const;
export const SPACINGS = ["compact", "balanced", "airy"] as const;
export const IMAGE_PLACEMENTS = ["top", "background", "inline", "none"] as const;
export const BACKGROUND_KINDS = ["solid", "gradient", "texture", "image", "video"] as const;
export const TEXTURES = ["none", "marble", "linen", "paper", "silk", "stone", "sunset", "bokeh"] as const;
export const ORNAMENTS = ["none", "botanical", "gold-frame", "palms", "geometric", "monogram", "olive"] as const;
export const OPENINGS = ["envelope", "fade", "slide", "paper", "cinematic", "botanical"] as const;
export type OpeningId = (typeof OPENINGS)[number];

/** Openings that require the Premium package or above. */
export const ADVANCED_OPENINGS: OpeningId[] = ["envelope", "paper", "cinematic", "botanical"];

export const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour");

/**
 * Media URLs may only be https URLs or same-origin file routes. They are later
 * placed inside CSS url() and <img src>, so quotes, parentheses, whitespace and
 * script schemes are rejected outright.
 */
export const mediaUrl = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      (/^https:\/\/[^\s"'()<>\\]+$/.test(v) || /^\/[A-Za-z0-9/_\-.]+$/.test(v)) && !v.includes(".."),
    "Unsupported media URL",
  );

export const photoSchema = z.object({
  id: z.string().min(1).max(64),
  url: mediaUrl,
  alt: z.string().max(200).default(""),
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
  zoom: z.number().min(1).max(3).default(1),
});
export type Photo = z.infer<typeof photoSchema>;

export const sectionSchema = z.object({
  id: z.enum(SECTION_IDS),
  visible: z.boolean(),
});

export const designSchema = z.object({
  version: z.literal(1),
  templateSlug: z.string().min(1).max(64),
  language: z.enum(["en", "he"]),
  layout: z.object({
    variant: z.enum(LAYOUT_VARIANTS),
    alignment: z.enum(["center", "start"]),
    spacing: z.enum(SPACINGS),
    imagePlacement: z.enum(IMAGE_PLACEMENTS),
    sections: z
      .array(sectionSchema)
      .length(SECTION_IDS.length)
      .refine((s) => new Set(s.map((x) => x.id)).size === SECTION_IDS.length, "Duplicate section"),
  }),
  typography: z.object({
    pairing: z.enum(FONT_PAIRINGS),
    scale: z.number().min(0.8).max(1.35),
    headingWeight: z.number().int().min(300).max(600),
    lineHeight: z.number().min(1.2).max(2),
    letterSpacing: z.number().min(-0.02).max(0.2),
    nameStyle: z.enum(["upright", "italic"]),
  }),
  colors: z.object({
    background: hexColor,
    surface: hexColor,
    text: hexColor,
    textSecondary: hexColor,
    accent: hexColor,
    button: hexColor,
    buttonText: hexColor,
  }),
  background: z.object({
    kind: z.enum(BACKGROUND_KINDS),
    gradient: z.object({ from: hexColor, to: hexColor, angle: z.number().min(0).max(360) }),
    texture: z.enum(TEXTURES),
    imageUrl: mediaUrl.nullable(),
    videoUrl: mediaUrl.nullable(),
    overlay: z.number().min(0).max(0.9),
  }),
  ornament: z.enum(ORNAMENTS),
  photos: z.object({
    hero: photoSchema.nullable(),
    gallery: z.array(photoSchema).max(24),
  }),
  animation: z.object({
    opening: z.enum(OPENINGS),
    particles: z.boolean(),
  }),
  music: z.object({
    enabled: z.boolean(),
    url: mediaUrl.nullable(),
    title: z.string().max(80).nullable(),
  }),
  content: z.object({
    eyebrow: z.string().max(90),
    headline: z.string().max(140),
    intro: z.string().max(1200),
    eventDetails: z.string().max(600),
    closing: z.string().max(300),
    rsvpPrompt: z.string().max(220),
  }),
  rsvp: z.object({
    enabled: z.boolean(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    defaultMaxAttendees: z.number().int().min(1).max(20),
    allowUpdates: z.boolean(),
    askDietary: z.boolean(),
    askMessage: z.boolean(),
    askCompanionNames: z.boolean(),
  }),
});

export type InvitationDesign = z.infer<typeof designSchema>;

/** Wedding facts come from the weddings table, never from the design. */
export type WeddingFacts = {
  brideFirstName: string;
  brideLastName: string;
  groomFirstName: string;
  groomLastName: string;
  displayOrder: "bride_first" | "groom_first";
  date: string | null; // YYYY-MM-DD
  ceremonyTime: string | null; // HH:MM
  receptionTime: string | null; // HH:MM
  timezone: string;
  venueName: string;
  venueAddress: string;
  city: string;
  eventDetails: string;
};

/** Guest-specific personalisation for a personal invitation link. */
export type GuestPersonalization = {
  guestName: string;
  firstName: string;
  maxAttendees: number;
};

export function parseDesign(input: unknown): InvitationDesign {
  return designSchema.parse(input);
}

export function safeParseDesign(input: unknown) {
  return designSchema.safeParse(input);
}

export function orderedSections(design: InvitationDesign) {
  return design.layout.sections.filter((s) => s.visible).map((s) => s.id);
}
