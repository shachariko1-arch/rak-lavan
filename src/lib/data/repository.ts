import type { Guest, InvitationGuest, RsvpPayload, Session, Wedding } from "../types";

export interface InvitationView {
  wedding: Wedding;
  /** Present only when the link carries a valid personal token. */
  guest: InvitationGuest | null;
}

export interface OpenRsvpIdentity {
  name: string;
  phone: string;
}

/**
 * Everything the app needs from a backend. Two implementations exist:
 * a browser-local demo store, and Supabase (Postgres + Auth + Realtime + Storage).
 */
export interface Repository {
  readonly mode: "demo" | "supabase";

  /* ── Organiser authentication ── */
  getSession(): Promise<Session | null>;
  onAuthChange(callback: (session: Session | null) => void): () => void;
  signIn(email: string, password: string): Promise<Session>;
  /** Resolves to null when the account needs e-mail confirmation first. */
  signUp(email: string, password: string): Promise<Session | null>;
  signInDemo(): Promise<Session>;
  signOut(): Promise<void>;

  /* ── Organiser data (private; requires a session) ── */
  listWeddings(): Promise<Wedding[]>;
  saveWedding(wedding: Wedding): Promise<Wedding>;
  isSlugAvailable(slug: string, exceptWeddingId?: string): Promise<boolean>;
  uploadPhoto(file: File, weddingId: string): Promise<string>;
  listGuests(weddingId: string): Promise<Guest[]>;
  upsertGuests(guests: Guest[]): Promise<void>;
  deleteGuests(weddingId: string, ids: string[]): Promise<void>;
  /** Calls back whenever guests of this wedding change, from any tab or device. */
  subscribeGuests(weddingId: string, callback: () => void): () => void;

  /* ── Guest-facing (public; scoped by slug + personal token) ── */
  getInvitation(slug: string, token?: string | null): Promise<InvitationView | null>;
  submitRsvp(slug: string, token: string, payload: RsvpPayload): Promise<InvitationGuest>;
  submitOpenRsvp(slug: string, identity: OpenRsvpIdentity, payload: RsvpPayload): Promise<InvitationGuest>;

  /* ── Demo only ── */
  resetDemo?(): Promise<void>;
}

export class SlugTakenError extends Error {
  constructor() {
    super("slug_taken");
    this.name = "SlugTakenError";
  }
}

export class AuthRequiredError extends Error {
  constructor() {
    super("auth_required");
    this.name = "AuthRequiredError";
  }
}

export const isSupabaseConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
