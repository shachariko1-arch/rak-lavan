"use client";

import { Check, CheckCheck, Copy, MessageCircle, RotateCcw, Send, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Segmented, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_MESSAGE_TEMPLATES, TEMPLATE_VARIABLES, coupleNames, guestDisplayName, messageVariables, renderMessage } from "@/lib/messaging/templates";
import type { MessageKind } from "@/lib/messaging/templates";
import { getMessagingProvider, whatsappShareLink } from "@/lib/messaging/provider";
import { currentOrigin, inviteDisplayUrl, inviteUrl } from "@/lib/site";
import type { Guest, Locale } from "@/lib/types";
import { copyText, formatPhone, formatWeddingDate } from "@/lib/utils";
import { useDashboard } from "./context";
import { PageHeader } from "./shell";

export function MessagesPage() {
  const { tr, locale, pick } = useI18n();
  const { wedding, guests, saveWedding, patchGuests } = useDashboard();
  const { toast } = useToast();
  const [kind, setKind] = useState<MessageKind>("invite");
  const [lang, setLang] = useState<Locale>(wedding?.language ?? "en");
  const [draft, setDraft] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState("");
  const [queue, setQueue] = useState<Guest[] | null>(null);
  const [position, setPosition] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);
  const provider = useMemo(() => getMessagingProvider(), []);
  const touched = useRef(false);

  // Open on whichever job is waiting: invitations if any are unsent, otherwise reminders.
  useEffect(() => {
    if (touched.current || !guests.length) return;
    touched.current = true;
    if (!guests.some((g) => g.status === "not_contacted")) setKind("reminder");
  }, [guests]);

  const audience = useMemo(
    () => guests.filter((g) => g.phone && (kind === "invite" ? g.status === "not_contacted" : g.status === "pending")).sort((a, b) => a.name.localeCompare(b.name)),
    [guests, kind],
  );
  if (!wedding) return null;

  const stored = wedding.messageTemplates?.[kind]?.[lang] || DEFAULT_MESSAGE_TEMPLATES[kind][lang];
  const text = draft ?? stored;
  const dirty = draft !== null && draft !== stored;
  const sample = guests.find((g) => g.id === previewId) ?? audience[0] ?? guests[0];
  const origin = currentOrigin();
  const preview = sample ? renderMessage(text, messageVariables(wedding, sample, lang, origin)) : text;
  const publicLink = inviteUrl(origin, wedding.slug);

  const switchTo = (nextKind: MessageKind, nextLang: Locale) => {
    touched.current = true;
    setKind(nextKind);
    setLang(nextLang);
    setDraft(null);
  };

  const save = async () => {
    await saveWedding({ ...wedding, messageTemplates: { ...wedding.messageTemplates, [kind]: { ...wedding.messageTemplates[kind], [lang]: text } } });
    setDraft(null);
    toast(tr("Template saved", "התבנית נשמרה"));
  };

  const insert = (key: string) => {
    const el = area.current;
    const token = `{{${key}}}`;
    const at = el?.selectionStart ?? text.length;
    setDraft(text.slice(0, at) + token + text.slice(el?.selectionEnd ?? at));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + token.length, at + token.length); });
  };

  const sendOne = async (g: Guest) => {
    const body = renderMessage(text, messageVariables(wedding, g, lang, origin));
    const result = await provider.send({ guestId: g.id, phone: g.phone, text: body });
    if (!result.ok) return toast(tr("The message could not be sent", "ההודעה לא נשלחה"), { tone: "error" });
    const now = new Date().toISOString();
    await patchGuests([g.id], (x) => (kind === "invite" ? { ...x, status: x.status === "not_contacted" ? "pending" : x.status, invitationSentAt: x.invitationSentAt ?? now } : { ...x, remindersSent: x.remindersSent + 1 }));
  };

  const current = queue?.[position];
  const advance = () => {
    if (!queue) return;
    if (position + 1 >= queue.length) {
      setQueue(null);
      toast(tr("All done", "סיימנו"), { description: tr(`${queue.length} conversations opened`, `נפתחו ${queue.length} שיחות`) });
    } else setPosition(position + 1);
  };

  return (
    <>
      <PageHeader eyebrow="WhatsApp" title={tr("Invitations & reminders", "הזמנות ותזכורות")}>
        <p className="mt-2 max-w-xl text-sm text-stone">
          {tr("Every guest gets a personal message with their own RSVP link. WhatsApp opens with the message ready; you press send.", "כל אורח מקבל הודעה אישית עם קישור אישי לאישור הגעה. וואטסאפ נפתח עם ההודעה מוכנה, ואתם לוחצים על שליחה.")}
        </p>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 sm:p-7 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label={tr("Message type", "סוג ההודעה")} value={kind} onChange={(k) => switchTo(k, lang)} options={[{ value: "invite", label: tr("Invitation", "הזמנה") }, { value: "reminder", label: tr("Reminder", "תזכורת") }]} />
            <Segmented size="sm" label={tr("Message language", "שפת ההודעה")} value={lang} onChange={(l) => switchTo(kind, l)} options={[{ value: "en", label: "English" }, { value: "he", label: "עברית" }]} />
          </div>
          <label htmlFor="template" className="mt-5 block text-[13px] font-medium text-ink-soft">{tr("Message template", "תבנית ההודעה")}</label>
          <Textarea id="template" ref={area} value={text} onChange={(e) => setDraft(e.target.value)} rows={8} dir={lang === "he" ? "rtl" : "ltr"} lang={lang} className="mt-1.5 font-sans" maxLength={1000} />
          <p className="mt-3 text-xs text-stone">{tr("Insert a personal detail:", "הוספת פרט אישי:")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map((v) => (
              <button key={v.key} type="button" onClick={() => insert(v.key)} className="rounded-full border border-line bg-cream/70 px-2.5 py-1 text-xs text-ink-soft transition hover:border-gold hover:bg-white">{pick(v.label)}</button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void save()} disabled={!dirty}>{tr("Save template", "שמירת התבנית")}</Button>
            <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => setDraft(DEFAULT_MESSAGE_TEMPLATES[kind][lang])}>{tr("Restore default", "שחזור ברירת המחדל")}</Button>
          </div>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <p className="text-sm font-medium">{tr("Preview", "תצוגה מקדימה")}</p>
              <div className="w-44">
                <Select compact aria-label={tr("Preview as guest", "תצוגה מקדימה עבור אורח")} value={sample?.id ?? ""} onChange={(e) => setPreviewId(e.target.value)}>
                  {(audience.length ? audience : guests).slice(0, 60).map((g) => <option key={g.id} value={g.id}>{guestDisplayName(g, locale)}</option>)}
                </Select>
              </div>
            </div>
            <div className="bg-[#efe7dd] p-4">
              <div dir={lang === "he" ? "rtl" : "ltr"} lang={lang} className="ms-auto max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-se-sm bg-[#d9fdd3] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#111b21] shadow-sm">
                {preview}
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">12:30 <CheckCheck className="size-3.5 text-[#53bdeb]" /></span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-2xl he:text-xl">{kind === "invite" ? tr("Send invitations", "שליחת הזמנות") : tr("Send reminders", "שליחת תזכורות")}</h2>
            <p className="mt-1 text-sm text-stone">
              {kind === "invite"
                ? tr(`${audience.length} guests have not received their invitation yet.`, `${audience.length} אורחים עדיין לא קיבלו את ההזמנה.`)
                : tr(`${audience.length} guests have not replied yet.`, `${audience.length} אורחים עדיין לא ענו.`)}
            </p>
            <Button className="mt-4 w-full" icon={<Send className="size-4 rtl:-scale-x-100" />} disabled={!audience.length} onClick={() => { setQueue(audience); setPosition(0); }}>
              {tr(`Start sending (${audience.length})`, `התחלת שליחה (${audience.length})`)}
            </Button>
            {dirty ? <p className="mt-2 text-xs text-pending-ink">{tr("Your unsaved edits will be used for this send.", "השליחה תשתמש בעריכה שעדיין לא נשמרה.")}</p> : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-2xl he:text-xl">{tr("Share the invitation", "שיתוף ההזמנה")}</h2>
            <p className="mt-1 break-all text-sm text-stone" dir="ltr">{inviteDisplayUrl(wedding.slug)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={whatsappShareLink(`${coupleNames(wedding, lang)} · ${formatWeddingDate(wedding.date, lang, "long")}\n${publicLink}`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[13px] font-medium text-ivory hover:bg-ink-soft">
                <MessageCircle className="size-3.5" /> {tr("Share on WhatsApp", "שיתוף בוואטסאפ")}
              </a>
              <Button size="sm" variant="outline" icon={<Copy className="size-3.5" />} onClick={async () => (await copyText(publicLink)) && toast(tr("Link copied", "הקישור הועתק"))}>{tr("Copy link", "העתקת קישור")}</Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(queue)}
        onClose={() => setQueue(null)}
        size="sm"
        title={tr(`Guest ${position + 1} of ${queue?.length ?? 0}`, `אורח ${position + 1} מתוך ${queue?.length ?? 0}`)}
        description={tr("Open WhatsApp, press send, then come back for the next guest.", "פתחו את וואטסאפ, לחצו שליחה, וחזרו לאורח הבא.")}
        footer={
          <>
            <Button variant="ghost" size="sm" icon={<SkipForward className="size-3.5 rtl:-scale-x-100" />} onClick={advance}>{tr("Skip", "דילוג")}</Button>
            <Button size="sm" icon={<MessageCircle className="size-3.5" />} onClick={async () => { if (current) await sendOne(current); advance(); }}>{tr("Open WhatsApp", "פתיחת וואטסאפ")}</Button>
          </>
        }
      >
        {current ? (
          <div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-cream"><div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${(position / (queue?.length || 1)) * 100}%` }} /></div>
            <p className="font-serif text-2xl">{guestDisplayName(current, locale)}</p>
            <p className="text-sm text-stone" dir="ltr">{formatPhone(current.phone)}</p>
            <p dir={lang === "he" ? "rtl" : "ltr"} className="mt-3 max-h-44 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cream/70 p-3 text-sm leading-relaxed">{renderMessage(text, messageVariables(wedding, current, lang, origin))}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-stone"><Check className="size-3.5 text-confirmed" />{kind === "invite" ? tr("The guest will be marked as invited.", "האורח יסומן כמי שקיבל הזמנה.") : tr("A reminder will be logged for this guest.", "התזכורת תתועד אצל האורח.")}</p>
          </div>
        ) : <span />}
      </Modal>
    </>
  );
}
