import { DIETARY, maxParty } from "../types";
import type { Dietary, Guest, InvitationGuest, PartyMember, RsvpPayload, Wedding } from "../types";
import { normalizePhone, randomId, uuid } from "../utils";

export const RSVP_LIMITS = { name: 80, text: 500, openPartyMax: 6 } as const;

export class RsvpError extends Error {
  constructor(
    public code:
      | "not_found"
      | "invalid"
      | "party_too_large"
      | "already_responded"
      | "phone_required"
      | "deadline_passed",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "RsvpError";
  }
}

const isDietary = (v: unknown): v is Dietary => typeof v === "string" && (DIETARY as string[]).includes(v);

/** Trims, caps and validates whatever arrived from the form. Never trusts the client. */
export function sanitizePayload(payload: RsvpPayload, limit: number): RsvpPayload {
  const party: PartyMember[] = payload.attending
    ? (payload.party ?? []).map((member) => ({
        // Companions may be left unnamed; the headcount still matters to the caterer.
        name: String(member?.name ?? "").trim().slice(0, RSVP_LIMITS.name),
        meal: isDietary(member?.meal) ? member.meal : ("regular" as Dietary),
        ...(member?.isChild ? { isChild: true } : {}),
      }))
    : [];
  if (payload.attending && party.length === 0) throw new RsvpError("invalid");
  if (party.length > limit) throw new RsvpError("party_too_large");
  return {
    attending: Boolean(payload.attending),
    party,
    specialRequests: String(payload.specialRequests ?? "").trim().slice(0, RSVP_LIMITS.text),
    message: String(payload.message ?? "").trim().slice(0, RSVP_LIMITS.text),
  };
}

/** Returns the guest as it should be stored after this answer. Answering again simply replaces it. */
export function applyRsvp(guest: Guest, payload: RsvpPayload, nowIso = new Date().toISOString()): Guest {
  const clean = sanitizePayload(payload, maxParty(guest));
  const party = clean.party.map((member, index) =>
    index === 0 && !member.name ? { ...member, name: guest.name } : member,
  );
  return {
    ...guest,
    status: clean.attending ? "confirmed" : "declined",
    attendees: clean.attending ? party.length : 0,
    party: clean.attending ? party : [],
    specialRequests: clean.specialRequests,
    message: clean.message,
    lastResponseAt: nowIso,
    invitationSentAt: guest.invitationSentAt ?? nowIso,
    responseCount: guest.responseCount + 1,
  };
}

export const toInvitationGuest = (g: Guest): InvitationGuest => ({
  id: g.id,
  token: g.token,
  name: g.name,
  nameHe: g.nameHe,
  phone: g.phone,
  invitedAdults: g.invitedAdults,
  invitedChildren: g.invitedChildren,
  plusOne: g.plusOne,
  status: g.status,
  attendees: g.attendees,
  party: g.party,
  specialRequests: g.specialRequests,
  message: g.message,
  lastResponseAt: g.lastResponseAt,
});

export function newGuest(weddingId: string, patch: Partial<Guest> = {}): Guest {
  return {
    id: uuid(),
    weddingId,
    token: randomId(16),
    name: "",
    phone: "",
    group: "",
    category: "friends",
    side: "both",
    invitedAdults: 1,
    invitedChildren: 0,
    plusOne: false,
    status: "not_contacted",
    attendees: 0,
    party: [],
    specialRequests: "",
    message: "",
    table: "",
    notes: "",
    invitationSentAt: null,
    lastResponseAt: null,
    remindersSent: 0,
    responseCount: 0,
    source: "host",
    createdAt: new Date().toISOString(),
    ...patch,
  };
}

/** A guest who answers through the public link, without a personal token. */
export function newOpenGuest(weddingId: string, name: string, phone: string, partySize: number): Guest {
  const adults = Math.min(Math.max(1, partySize), RSVP_LIMITS.openPartyMax);
  return newGuest(weddingId, {
    name: name.trim().slice(0, RSVP_LIMITS.name),
    phone: normalizePhone(phone),
    group: "Public link",
    groupHe: "קישור כללי",
    category: "other",
    invitedAdults: adults,
    source: "public_link",
  });
}

export const isPastDeadline = (wedding: Pick<Wedding, "rsvpDeadline" | "date">, now = new Date()): boolean => {
  // RSVPs stay open until the wedding day itself; the deadline is a nudge, not a lock.
  const [y, m, d] = wedding.date.split("-").map(Number);
  const dayAfter = new Date(y, (m || 1) - 1, (d || 1) + 1);
  return now.getTime() >= dayAfter.getTime();
};
