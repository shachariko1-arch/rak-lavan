import { normalizePhone } from "../utils";

/**
 * Messaging is behind one small interface so the transport can change without touching
 * the UI. Today: WhatsApp share links (wa.me), opened one conversation at a time by the
 * couple. Later: the WhatsApp Business Cloud API, sent server-side from /api/whatsapp/send.
 */
export interface OutgoingMessage {
  /** Guest id, so a server-side provider can verify ownership and log delivery. */
  guestId: string;
  phone: string;
  text: string;
}

export interface SendResult {
  ok: boolean;
  /** "opened": handed to WhatsApp for the user to press send. "sent": delivered by API. */
  state: "opened" | "sent" | "failed";
  error?: string;
}

export interface MessagingProvider {
  readonly id: "whatsapp-link" | "whatsapp-cloud";
  /** True when messages go out without the user pressing send in WhatsApp. */
  readonly automatic: boolean;
  send(message: OutgoingMessage): Promise<SendResult>;
}

export const whatsappLink = (phone: string, text: string): string => {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

/** Share to a contact the user picks inside WhatsApp (no phone number). */
export const whatsappShareLink = (text: string): string => `https://wa.me/?text=${encodeURIComponent(text)}`;

export const whatsappLinkProvider: MessagingProvider = {
  id: "whatsapp-link",
  automatic: false,
  async send({ phone, text }) {
    if (!normalizePhone(phone)) return { ok: false, state: "failed", error: "missing_phone" };
    window.open(whatsappLink(phone, text), "_blank", "noopener,noreferrer");
    return { ok: true, state: "opened" };
  },
};

/** Calls our own API route, which talks to the WhatsApp Business Cloud API. */
export function createCloudProvider(getAccessToken: () => Promise<string | null>): MessagingProvider {
  return {
    id: "whatsapp-cloud",
    automatic: true,
    async send(message) {
      const token = await getAccessToken();
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(message),
      });
      if (!response.ok) return { ok: false, state: "failed", error: (await response.json().catch(() => ({}))).error };
      return { ok: true, state: "sent" };
    },
  };
}

export function getMessagingProvider(): MessagingProvider {
  if (process.env.NEXT_PUBLIC_WHATSAPP_PROVIDER === "cloud") {
    return createCloudProvider(async () => {
      const { getSupabase } = await import("../data/supabase-repo");
      const { data } = await (await getSupabase()).auth.getSession();
      return data.session?.access_token ?? null;
    });
  }
  return whatsappLinkProvider;
}
