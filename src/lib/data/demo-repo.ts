import { maxParty } from "../types";
import type { Guest, InvitationGuest, RsvpPayload, Session, Wedding } from "../types";
import { isValidPhone, normalizePhone } from "../utils";
import { DEMO_EMAIL, DEMO_USER_ID, buildDemoGuests, buildDemoWedding } from "./demo-seed";
import { blobToDataUrl, downscaleImage } from "./image";
import { AuthRequiredError, SlugTakenError } from "./repository";
import type { InvitationView, OpenRsvpIdentity, Repository } from "./repository";
import { RSVP_LIMITS, RsvpError, applyRsvp, isPastDeadline, newOpenGuest, sanitizePayload, toInvitationGuest } from "./rsvp";

/**
 * Demo backend. Everything lives in this browser's localStorage, seeded with the
 * Noa & Daniel wedding. Changes are broadcast to other tabs, so an RSVP submitted in
 * one tab updates a dashboard open in another, the same way Supabase Realtime does.
 */

const STORAGE_KEY = "vow.demo.v1";
const CHANNEL_NAME = "vow-demo";

interface DemoDB {
  v: 1;
  seededAt: string;
  weddings: Wedding[];
  guests: Guest[];
  session: Session | null;
}

export class StorageFullError extends Error {
  constructor() {
    super("storage_full");
    this.name = "StorageFullError";
  }
}

let cache: DemoDB | null = null;
let channel: BroadcastChannel | null = null;
let wired = false;
const changeListeners = new Set<() => void>();
const authListeners = new Set<(session: Session | null) => void>();

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function seed(session: Session | null = null): DemoDB {
  const now = Date.now();
  return {
    v: 1,
    seededAt: new Date(now).toISOString(),
    weddings: [buildDemoWedding(now)],
    guests: buildDemoGuests(now),
    session,
  };
}

function db(): DemoDB {
  if (cache) return cache;
  wire();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDB;
      if (parsed?.v === 1 && Array.isArray(parsed.guests) && Array.isArray(parsed.weddings)) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    // Unreadable or blocked storage: fall through to a fresh in-memory seed.
  }
  cache = seed();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode or full disk. The demo still works for this tab, in memory.
  }
  return cache;
}

function commit() {
  if (!cache) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    throw new StorageFullError();
  }
  channel?.postMessage({ type: "changed" });
  changeListeners.forEach((listener) => listener());
}

function reloadFromStorage() {
  const before = JSON.stringify(cache?.session ?? null);
  cache = null;
  const next = db();
  changeListeners.forEach((listener) => listener());
  if (JSON.stringify(next.session) !== before) authListeners.forEach((listener) => listener(next.session));
}

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = reloadFromStorage;
  } else {
    (window as Window).addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) reloadFromStorage();
    });
  }
}

function requireSession(): Session {
  const session = db().session;
  if (!session) throw new AuthRequiredError();
  return session;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function setSession(session: Session | null) {
  db().session = session;
  commit();
  authListeners.forEach((listener) => listener(session));
}

function findWedding(slug: string): Wedding | undefined {
  return db().weddings.find((w) => w.slug === slug.toLowerCase());
}

export function createDemoRepository(): Repository {
  return {
    mode: "demo",

    async getSession() {
      return db().session;
    },

    onAuthChange(callback) {
      wire();
      authListeners.add(callback);
      return () => authListeners.delete(callback);
    },

    async signIn(email) {
      await wait(350);
      const session: Session = { userId: DEMO_USER_ID, email: email.trim() || DEMO_EMAIL, demo: true };
      setSession(session);
      return session;
    },

    async signUp(email) {
      await wait(350);
      const session: Session = { userId: DEMO_USER_ID, email: email.trim() || DEMO_EMAIL, demo: true };
      setSession(session);
      return session;
    },

    async signInDemo() {
      const session: Session = { userId: DEMO_USER_ID, email: DEMO_EMAIL, demo: true };
      setSession(session);
      return session;
    },

    async signOut() {
      setSession(null);
    },

    async listWeddings() {
      const session = requireSession();
      return clone(db().weddings.filter((w) => w.ownerId === session.userId)).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    },

    async saveWedding(wedding) {
      const state = db();
      if (!state.session) state.session = { userId: DEMO_USER_ID, email: DEMO_EMAIL, demo: true };
      const slug = wedding.slug.toLowerCase();
      if (state.weddings.some((w) => w.slug === slug && w.id !== wedding.id)) throw new SlugTakenError();
      const next: Wedding = { ...clone(wedding), slug, ownerId: state.session.userId };
      const index = state.weddings.findIndex((w) => w.id === wedding.id);
      if (index >= 0) state.weddings[index] = next;
      else state.weddings.push(next);
      commit();
      authListeners.forEach((listener) => listener(state.session));
      return clone(next);
    },

    async isSlugAvailable(slug, exceptWeddingId) {
      const wanted = slug.toLowerCase();
      return !db().weddings.some((w) => w.slug === wanted && w.id !== exceptWeddingId);
    },

    async uploadPhoto(file) {
      // No object storage in the demo: keep a compact JPEG inline.
      const blob = await downscaleImage(file, 1100, 0.74);
      return blobToDataUrl(blob);
    },

    async listGuests(weddingId) {
      requireSession();
      return clone(db().guests.filter((g) => g.weddingId === weddingId));
    },

    async upsertGuests(guests) {
      requireSession();
      const state = db();
      const position = new Map(state.guests.map((g, i) => [g.id, i]));
      for (const guest of guests) {
        const index = position.get(guest.id);
        if (index === undefined) {
          position.set(guest.id, state.guests.length);
          state.guests.push(clone(guest));
        } else state.guests[index] = clone(guest);
      }
      commit();
    },

    async deleteGuests(weddingId, ids) {
      requireSession();
      const state = db();
      const doomed = new Set(ids);
      state.guests = state.guests.filter((g) => !(g.weddingId === weddingId && doomed.has(g.id)));
      commit();
    },

    subscribeGuests(_weddingId, callback) {
      wire();
      changeListeners.add(callback);
      return () => changeListeners.delete(callback);
    },

    async getInvitation(slug, token) {
      const wedding = findWedding(slug);
      if (!wedding) return null;
      const guest = token
        ? db().guests.find((g) => g.weddingId === wedding.id && g.token === token)
        : undefined;
      const view: InvitationView = {
        wedding: clone(wedding),
        guest: guest ? clone(toInvitationGuest(guest)) : null,
      };
      return view;
    },

    async submitRsvp(slug, token, payload: RsvpPayload): Promise<InvitationGuest> {
      await wait(450);
      const state = db();
      const wedding = findWedding(slug);
      if (!wedding) throw new RsvpError("not_found");
      if (isPastDeadline(wedding)) throw new RsvpError("deadline_passed");
      const index = state.guests.findIndex((g) => g.weddingId === wedding.id && g.token === token);
      if (index < 0) throw new RsvpError("not_found");
      // Answering again replaces the previous answer on the same record: no duplicates.
      state.guests[index] = applyRsvp(state.guests[index], payload);
      commit();
      return clone(toInvitationGuest(state.guests[index]));
    },

    async submitOpenRsvp(slug, identity: OpenRsvpIdentity, payload: RsvpPayload): Promise<InvitationGuest> {
      await wait(450);
      const state = db();
      const wedding = findWedding(slug);
      if (!wedding || !wedding.allowOpenRsvp) throw new RsvpError("not_found");
      if (isPastDeadline(wedding)) throw new RsvpError("deadline_passed");
      const name = identity.name.trim();
      if (!name) throw new RsvpError("invalid");
      if (!isValidPhone(identity.phone)) throw new RsvpError("phone_required");
      const phone = normalizePhone(identity.phone);

      // One record per phone number per wedding.
      const index = state.guests.findIndex((g) => g.weddingId === wedding.id && normalizePhone(g.phone) === phone);
      if (index >= 0) {
        const existing = state.guests[index];
        // Someone the couple invited by name, who has already answered through their own link.
        if (existing.source !== "public_link" && existing.responseCount > 0) {
          throw new RsvpError("already_responded");
        }
        if (existing.source === "public_link") {
          const size = Math.min(RSVP_LIMITS.openPartyMax, Math.max(1, payload.party?.length ?? 1));
          existing.invitedAdults = Math.max(existing.invitedAdults, size);
          existing.name = name;
        } else {
          sanitizePayload(payload, maxParty(existing)); // throws party_too_large
        }
        state.guests[index] = applyRsvp(existing, payload);
        commit();
        return clone(toInvitationGuest(state.guests[index]));
      }

      const size = payload.attending ? (payload.party?.length ?? 1) : 1;
      if (size > RSVP_LIMITS.openPartyMax) throw new RsvpError("party_too_large");
      const created = applyRsvp(newOpenGuest(wedding.id, name, phone, size), payload);
      state.guests.push(created);
      commit();
      return clone(toInvitationGuest(created));
    },

    async resetDemo() {
      const session = db().session;
      cache = seed(session);
      commit();
    },
  };
}
