export type Locale = "en" | "he";
export const LOCALES: Locale[] = ["en", "he"];
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "he";

/** A string that exists in both supported languages. */
export type L10n = { en: string; he: string };

export type RsvpStatus = "confirmed" | "declined" | "pending" | "not_contacted";
export const RSVP_STATUSES: RsvpStatus[] = ["confirmed", "declined", "pending", "not_contacted"];

export type Dietary =
  | "regular"
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "kosher_mehadrin"
  | "kids"
  | "allergy";
export const DIETARY: Dietary[] = [
  "regular",
  "vegetarian",
  "vegan",
  "gluten_free",
  "kosher_mehadrin",
  "kids",
  "allergy",
];

export type GuestCategory = "family" | "friends" | "work" | "other";
export const GUEST_CATEGORIES: GuestCategory[] = ["family", "friends", "work", "other"];

export type Side = "bride" | "groom" | "both";
export const SIDES: Side[] = ["bride", "groom", "both"];

/** One person who is actually coming, as entered in the RSVP form. */
export interface PartyMember {
  name: string;
  meal: Dietary;
  isChild?: boolean;
}

export interface Guest {
  id: string;
  weddingId: string;
  /** Unguessable token that makes this guest's personal invitation link. */
  token: string;
  name: string;
  /** Optional Hebrew spelling, shown when the interface is in Hebrew. */
  nameHe?: string;
  phone: string;
  /** Invitation group or family, e.g. "Cohen family". */
  group: string;
  groupHe?: string;
  category: GuestCategory;
  side: Side;
  invitedAdults: number;
  invitedChildren: number;
  plusOne: boolean;
  status: RsvpStatus;
  /** People confirmed as coming. 0 unless status is "confirmed". */
  attendees: number;
  party: PartyMember[];
  specialRequests: string;
  message: string;
  table: string;
  notes: string;
  invitationSentAt: string | null;
  lastResponseAt: string | null;
  remindersSent: number;
  responseCount: number;
  createdAt: string;
}

export type TemplateId =
  | "classic"
  | "minimal"
  | "garden"
  | "mediterranean"
  | "royal"
  | "editorial";

export type WeddingStyle =
  | "classic"
  | "modern"
  | "romantic"
  | "mediterranean"
  | "glamorous"
  | "editorial";

export interface Palette {
  id: string;
  name: L10n;
  /** Paper colour. */
  bg: string;
  /** Text colour. */
  ink: string;
  /** Rules, monograms, highlights. */
  accent: string;
  /** Optional second tone for designs that use one (blossoms, the sun). */
  accent2?: string;
  /** Secondary surface behind the card and in page sections. */
  soft: string;
}

export interface InviteText {
  /** Line above the names, e.g. "Together with their families". */
  opening: string;
  /** Line below the names, e.g. "invite you to celebrate their wedding". */
  invitation: string;
  /** Closing line, e.g. "Dinner and dancing to follow". */
  closing: string;
}

export interface MessageTemplates {
  invite: L10n;
  reminder: L10n;
}

export interface Wedding {
  id: string;
  slug: string;
  ownerId: string;
  bride: L10n;
  groom: L10n;
  brideLast: L10n;
  groomLast: L10n;
  /** YYYY-MM-DD, the local calendar date of the wedding. */
  date: string;
  /** HH:mm, 24h. */
  receptionTime: string;
  ceremonyTime: string;
  venue: L10n;
  address: L10n;
  /** Primary language of the invitation. Guests can still switch. */
  language: Locale;
  style: WeddingStyle;
  colors: string[];
  templateId: TemplateId;
  palette: Palette;
  text: { en: InviteText; he: InviteText };
  /** Personalised introduction shown under the card ("our story"). */
  intro: L10n;
  /** The couple's own words, exactly as they typed them. */
  personalMessage: string;
  photos: string[];
  rsvpDeadline: string | null;
  messageTemplates: MessageTemplates;
  createdAt: string;
}

/** What a guest sends from the RSVP form. */
export interface RsvpPayload {
  attending: boolean;
  party: PartyMember[];
  specialRequests: string;
  message: string;
}

/** The subset of a guest that their own invitation page is allowed to see. */
export interface InvitationGuest {
  id: string;
  token: string;
  name: string;
  nameHe?: string;
  phone: string;
  invitedAdults: number;
  invitedChildren: number;
  plusOne: boolean;
  status: RsvpStatus;
  attendees: number;
  party: PartyMember[];
  specialRequests: string;
  message: string;
  lastResponseAt: string | null;
}

export interface Session {
  userId: string;
  email: string;
  demo: boolean;
}

export const maxParty = (g: Pick<Guest, "invitedAdults" | "invitedChildren" | "plusOne">) =>
  Math.max(1, g.invitedAdults + g.invitedChildren + (g.plusOne ? 1 : 0));
