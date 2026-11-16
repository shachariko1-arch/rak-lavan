import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEFAULT_MESSAGE_TEMPLATES } from "../messaging/templates";
import { defaultPalette, isTemplateId } from "../templates";
import type { Guest, InvitationGuest, L10n, RsvpPayload, Session, Wedding } from "../types";
import { uuid } from "../utils";
import { downscaleImage } from "./image";
import { AuthRequiredError, SlugTakenError } from "./repository";
import type { InvitationView, OpenRsvpIdentity, Repository } from "./repository";
import { RsvpError } from "./rsvp";

/**
 * Supabase backend: Postgres with Row Level Security, Auth, Realtime and Storage.
 * The schema, policies and guest-facing functions live in supabase/migrations.
 * supabase-js is loaded on demand so the demo build does not carry it.
 */

const MEDIA_BUCKET = "wedding-media";
const PAGE = 1000;
const CHUNK = 500;

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
      ),
    );
  }
  return clientPromise;
}

const toSession = (user: User | null | undefined): Session | null =>
  user ? { userId: user.id, email: user.email ?? "", demo: false } : null;

/* ───────────────────────── row mapping ───────────────────────── */

type Row = Record<string, unknown>;

const asL10n = (value: unknown): L10n => {
  const v = (value ?? {}) as Partial<L10n>;
  return { en: v.en ?? "", he: v.he ?? "" };
};

function weddingFromRow(row: Row): Wedding {
  const related = row.invitations;
  const inv = ((Array.isArray(related) ? related[0] : related) ?? {}) as Row;
  const templateId = isTemplateId(inv.template_id) ? inv.template_id : "classic";
  const templates = (row.message_templates ?? {}) as Partial<Wedding["messageTemplates"]>;
  return {
    id: String(row.id),
    slug: String(row.slug),
    ownerId: String(row.owner_id ?? ""),
    bride: asL10n(row.bride),
    groom: asL10n(row.groom),
    brideLast: asL10n(row.bride_last),
    groomLast: asL10n(row.groom_last),
    date: String(row.wedding_date),
    receptionTime: String(row.reception_time),
    ceremonyTime: String(row.ceremony_time),
    venue: asL10n(row.venue),
    address: asL10n(row.address),
    language: row.language === "en" ? "en" : "he",
    style: (row.style as Wedding["style"]) ?? "classic",
    colors: (row.colors as string[]) ?? [],
    templateId,
    palette: (inv.palette as Wedding["palette"]) ?? defaultPalette(templateId),
    text: (inv.text as Wedding["text"]) ?? {
      en: { opening: "", invitation: "", closing: "" },
      he: { opening: "", invitation: "", closing: "" },
    },
    intro: asL10n(inv.intro),
    personalMessage: String(inv.personal_message ?? ""),
    photos: (inv.photos as string[]) ?? [],
    rsvpDeadline: (row.rsvp_deadline as string | null) ?? null,
    allowOpenRsvp: row.allow_open_rsvp !== false,
    messageTemplates: {
      invite: templates.invite ?? DEFAULT_MESSAGE_TEMPLATES.invite,
      reminder: templates.reminder ?? DEFAULT_MESSAGE_TEMPLATES.reminder,
    },
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

const weddingToRow = (w: Wedding, ownerId: string): Row => ({
  id: w.id,
  owner_id: ownerId,
  slug: w.slug.toLowerCase(),
  bride: w.bride,
  groom: w.groom,
  bride_last: w.brideLast,
  groom_last: w.groomLast,
  wedding_date: w.date,
  reception_time: w.receptionTime,
  ceremony_time: w.ceremonyTime,
  venue: w.venue,
  address: w.address,
  language: w.language,
  style: w.style,
  colors: w.colors,
  rsvp_deadline: w.rsvpDeadline,
  allow_open_rsvp: w.allowOpenRsvp,
  message_templates: w.messageTemplates,
});

const invitationToRow = (w: Wedding): Row => ({
  wedding_id: w.id,
  template_id: w.templateId,
  palette: w.palette,
  text: w.text,
  intro: w.intro,
  personal_message: w.personalMessage,
  photos: w.photos,
});

function guestFromRow(row: Row): Guest {
  return {
    id: String(row.id),
    weddingId: String(row.wedding_id),
    token: String(row.token),
    name: String(row.name ?? ""),
    nameHe: (row.name_he as string | null) ?? undefined,
    phone: String(row.phone ?? ""),
    group: String(row.group_name ?? ""),
    groupHe: (row.group_name_he as string | null) ?? undefined,
    category: row.category as Guest["category"],
    side: row.side as Guest["side"],
    invitedAdults: Number(row.invited_adults ?? 1),
    invitedChildren: Number(row.invited_children ?? 0),
    plusOne: Boolean(row.plus_one),
    status: row.status as Guest["status"],
    attendees: Number(row.attendees ?? 0),
    party: (row.party as Guest["party"]) ?? [],
    specialRequests: String(row.special_requests ?? ""),
    message: String(row.message ?? ""),
    table: String(row.table_name ?? ""),
    notes: String(row.notes ?? ""),
    invitationSentAt: (row.invitation_sent_at as string | null) ?? null,
    lastResponseAt: (row.last_response_at as string | null) ?? null,
    remindersSent: Number(row.reminders_sent ?? 0),
    responseCount: Number(row.response_count ?? 0),
    source: (row.source as Guest["source"]) ?? "host",
    createdAt: String(row.created_at ?? ""),
  };
}

const guestToRow = (g: Guest): Row => ({
  id: g.id,
  wedding_id: g.weddingId,
  token: g.token,
  name: g.name,
  name_he: g.nameHe ?? null,
  phone: g.phone,
  group_name: g.group,
  group_name_he: g.groupHe ?? null,
  category: g.category,
  side: g.side,
  invited_adults: g.invitedAdults,
  invited_children: g.invitedChildren,
  plus_one: g.plusOne,
  status: g.status,
  attendees: g.attendees,
  party: g.party,
  special_requests: g.specialRequests,
  message: g.message,
  table_name: g.table,
  notes: g.notes,
  invitation_sent_at: g.invitationSentAt,
  last_response_at: g.lastResponseAt,
  reminders_sent: g.remindersSent,
  response_count: g.responseCount,
  source: g.source,
});

/** The public wedding JSON from get_invitation() already uses camelCase. */
function weddingFromPublic(value: Row): Wedding {
  const templateId = isTemplateId(value.templateId) ? value.templateId : "classic";
  return {
    ...(value as unknown as Wedding),
    templateId,
    ownerId: "",
    photos: (value.photos as string[]) ?? [],
    colors: (value.colors as string[]) ?? [],
    messageTemplates: DEFAULT_MESSAGE_TEMPLATES,
  };
}

const RSVP_CODES = ["not_found", "invalid", "party_too_large", "already_responded", "phone_required", "deadline_passed"] as const;

function toRsvpError(message: string | undefined): Error {
  const code = RSVP_CODES.find((c) => message?.includes(c));
  return code ? new RsvpError(code) : new Error(message || "request_failed");
}

async function requireUser(sb: SupabaseClient): Promise<User> {
  const { data } = await sb.auth.getSession();
  if (!data.session?.user) throw new AuthRequiredError();
  return data.session.user;
}

export function createSupabaseRepository(): Repository {
  return {
    mode: "supabase",

    async getSession() {
      const sb = await getSupabase();
      const { data } = await sb.auth.getSession();
      return toSession(data.session?.user);
    },

    onAuthChange(callback) {
      let unsubscribe: (() => void) | null = null;
      let cancelled = false;
      void getSupabase().then((sb) => {
        if (cancelled) return;
        const { data } = sb.auth.onAuthStateChange((_event, session) => callback(toSession(session?.user)));
        unsubscribe = () => data.subscription.unsubscribe();
      });
      return () => {
        cancelled = true;
        unsubscribe?.();
      };
    },

    async signIn(email, password) {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error(error?.message || "sign_in_failed");
      return toSession(data.user) as Session;
    },

    async signUp(email, password) {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      // With e-mail confirmation on, there is a user but no session yet.
      return data.session ? toSession(data.user) : null;
    },

    async signInDemo() {
      throw new Error("demo_unavailable");
    },

    async signOut() {
      const sb = await getSupabase();
      await sb.auth.signOut();
    },

    async listWeddings() {
      const sb = await getSupabase();
      await requireUser(sb);
      const { data, error } = await sb.from("weddings").select("*, invitations(*)").order("created_at");
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => weddingFromRow(row as Row));
    },

    async saveWedding(wedding) {
      const sb = await getSupabase();
      const user = await requireUser(sb);
      const { error } = await sb.from("weddings").upsert(weddingToRow(wedding, user.id), { onConflict: "id" });
      if (error) {
        if (error.code === "23505") throw new SlugTakenError();
        throw new Error(error.message);
      }
      const { error: invitationError } = await sb
        .from("invitations")
        .upsert(invitationToRow(wedding), { onConflict: "wedding_id" });
      if (invitationError) throw new Error(invitationError.message);
      return { ...wedding, slug: wedding.slug.toLowerCase(), ownerId: user.id };
    },

    async isSlugAvailable(slug, exceptWeddingId) {
      const sb = await getSupabase();
      const { data, error } = await sb.rpc("is_slug_available", {
        p_slug: slug,
        p_except: exceptWeddingId ?? null,
      });
      if (error) throw new Error(error.message);
      return Boolean(data);
    },

    async uploadPhoto(file, weddingId) {
      const sb = await getSupabase();
      const user = await requireUser(sb);
      const blob = await downscaleImage(file, 1800, 0.84);
      const path = `${user.id}/${weddingId}/${uuid()}.jpg`;
      const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, blob, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
      });
      if (error) throw new Error(error.message);
      return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
    },

    async listGuests(weddingId) {
      const sb = await getSupabase();
      await requireUser(sb);
      const all: Guest[] = [];
      // PostgREST caps a response at 1000 rows; page through larger weddings.
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await sb
          .from("guests")
          .select("*")
          .eq("wedding_id", weddingId)
          .order("created_at")
          .order("id")
          .range(from, from + PAGE - 1);
        if (error) throw new Error(error.message);
        all.push(...(data ?? []).map((row) => guestFromRow(row as Row)));
        if (!data || data.length < PAGE) break;
      }
      return all;
    },

    async upsertGuests(guests) {
      const sb = await getSupabase();
      await requireUser(sb);
      for (let i = 0; i < guests.length; i += CHUNK) {
        const rows = guests.slice(i, i + CHUNK).map(guestToRow);
        const { error } = await sb.from("guests").upsert(rows, { onConflict: "id" });
        if (error) throw new Error(error.message);
      }
    },

    async deleteGuests(weddingId, ids) {
      const sb = await getSupabase();
      await requireUser(sb);
      for (let i = 0; i < ids.length; i += CHUNK) {
        const { error } = await sb
          .from("guests")
          .delete()
          .eq("wedding_id", weddingId)
          .in("id", ids.slice(i, i + CHUNK));
        if (error) throw new Error(error.message);
      }
    },

    subscribeGuests(weddingId, callback) {
      let cleanup: (() => void) | null = null;
      let cancelled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      // A burst of row changes (a bulk update) becomes one refresh.
      const debounced = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(callback, 250);
      };
      void getSupabase().then((sb) => {
        if (cancelled) return;
        const channel = sb
          .channel(`guests:${weddingId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "guests", filter: `wedding_id=eq.${weddingId}` },
            debounced,
          )
          .subscribe();
        cleanup = () => void sb.removeChannel(channel);
      });
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
        cleanup?.();
      };
    },

    async getInvitation(slug, token) {
      const sb = await getSupabase();
      const { data, error } = await sb.rpc("get_invitation", { p_slug: slug, p_token: token ?? null });
      if (error) throw new Error(error.message);
      if (!data) return null;
      const payload = data as { wedding: Row; guest: InvitationGuest | null };
      const view: InvitationView = {
        wedding: weddingFromPublic(payload.wedding),
        guest: payload.guest ? { ...payload.guest, nameHe: payload.guest.nameHe ?? undefined } : null,
      };
      return view;
    },

    async submitRsvp(slug, token, payload: RsvpPayload) {
      const sb = await getSupabase();
      const { data, error } = await sb.rpc("submit_rsvp", { p_slug: slug, p_token: token, p_payload: payload });
      if (error) throw toRsvpError(error.message);
      return data as InvitationGuest;
    },

    async submitOpenRsvp(slug, identity: OpenRsvpIdentity, payload: RsvpPayload) {
      const sb = await getSupabase();
      const { data, error } = await sb.rpc("submit_open_rsvp", {
        p_slug: slug,
        p_name: identity.name,
        p_phone: identity.phone,
        p_payload: payload,
      });
      if (error) throw toRsvpError(error.message);
      return data as InvitationGuest;
    },
  };
}
