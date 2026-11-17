import { NextResponse } from "next/server";

/**
 * POST /api/whatsapp/send  { guestId, text }
 *
 * Server side of the WhatsApp Business Cloud API provider (see src/lib/messaging/provider.ts).
 * Disabled until WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set; the app uses
 * wa.me share links until then.
 *
 * The caller must be a signed-in couple. The guest is looked up with the caller's own
 * Supabase token, so Row Level Security guarantees they can only message their own guests,
 * and the phone number always comes from the database, never from the request.
 *
 * Note: outside the 24-hour customer-service window, WhatsApp only delivers approved
 * template messages. Set WHATSAPP_TEMPLATE_NAME to an approved template with one body
 * variable to send that way; otherwise a plain text message is sent.
 */
export async function POST(request: Request) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !phoneNumberId || !supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "whatsapp_api_not_configured" }, { status: 501 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { guestId?: unknown; text?: unknown } | null;
  const guestId = typeof body?.guestId === "string" ? body.guestId : "";
  const text = typeof body?.text === "string" ? body.text.slice(0, 1500) : "";
  if (!/^[0-9a-f-]{36}$/i.test(guestId) || !text) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: guest, error } = await supabase.from("guests").select("id, phone_normalized").eq("id", guestId).maybeSingle();
  if (error || !guest?.phone_normalized) return NextResponse.json({ error: "guest_not_found" }, { status: 404 });

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to: guest.phone_normalized,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "he" },
          components: [{ type: "body", parameters: [{ type: "text", text }] }],
        },
      }
    : { messaging_product: "whatsapp", to: guest.phone_normalized, type: "text", text: { preview_url: true, body: text } };

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return NextResponse.json({ error: "whatsapp_rejected" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
