"use client";

import { Copy, Download, FileSpreadsheet, MessageCircle, Pencil, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/misc";
import { Drawer, Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { newGuest } from "@/lib/data/rsvp";
import { IMPORT_FIELDS, IMPORT_TEMPLATE, guessMapping, readSpreadsheet, rowsToGuests, toCsv } from "@/lib/guest-io";
import type { ImportField } from "@/lib/guest-io";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL, DIETARY_LABEL, SIDE_LABEL, STATUS_LABEL } from "@/lib/labels";
import { buildGuestMessage, guestDisplayName } from "@/lib/messaging/templates";
import { whatsappLink } from "@/lib/messaging/provider";
import { currentOrigin, inviteUrl } from "@/lib/site";
import { GUEST_CATEGORIES, RSVP_STATUSES, SIDES, maxParty } from "@/lib/types";
import type { Guest, RsvpStatus, Wedding } from "@/lib/types";
import { copyText, downloadBlob, formatDateTime, formatPhone, isValidPhone, normalizePhone } from "@/lib/utils";

/* ───────────────────────── Add / edit ───────────────────────── */

export function GuestFormModal({ open, guest, weddingId, groups, onClose, onSave }: { open: boolean; guest: Guest | null; weddingId: string; groups: string[]; onClose: () => void; onSave: (guest: Guest) => Promise<void> }) {
  const { tr, pick } = useI18n();
  const [draft, setDraft] = useState<Guest>(() => guest ?? newGuest(weddingId));
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(guest ? { ...guest } : newGuest(weddingId));
      setErrors({});
    }
  }, [open, guest, weddingId]);

  const set = <K extends keyof Guest>(key: K, value: Guest[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = tr("Please enter a name.", "נא להזין שם.");
    if (draft.phone && !isValidPhone(draft.phone)) next.phone = tr("This phone number does not look right.", "מספר הטלפון לא נראה תקין.");
    setErrors(next);
    if (Object.keys(next).length) return;
    const limit = maxParty(draft);
    const now = new Date().toISOString();
    const statusChanged = !guest || guest.status !== draft.status;
    const attendees = draft.status === "confirmed" ? Math.min(Math.max(1, draft.attendees || 1), limit) : 0;
    setSaving(true);
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        // A Hebrew spelling only applies to the name it was written for.
        nameHe: guest && guest.name === draft.name.trim() ? draft.nameHe : undefined,
        groupHe: guest && guest.group === draft.group ? draft.groupHe : undefined,
        phone: normalizePhone(draft.phone),
        attendees,
        party: draft.status === "confirmed" ? draft.party.slice(0, attendees) : [],
        invitationSentAt: draft.status === "not_contacted" ? null : (draft.invitationSentAt ?? now),
        lastResponseAt: statusChanged && (draft.status === "confirmed" || draft.status === "declined") ? now : draft.lastResponseAt,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={guest ? tr("Edit guest", "עריכת אורח") : tr("Add a guest", "הוספת אורח")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{tr("Cancel", "ביטול")}</Button>
          <Button type="submit" form="guest-form" loading={saving}>{guest ? tr("Save changes", "שמירת שינויים") : tr("Add guest", "הוספת אורח")}</Button>
        </>
      }
    >
      <form id="guest-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label={tr("Guest name", "שם האורח")} error={errors.name}>
          {(f) => <Input id={f.id} data-autofocus invalid={f.invalid} aria-describedby={f.describedBy} value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={120} autoComplete="off" />}
        </Field>
        <Field label={tr("Phone number", "מספר טלפון")} error={errors.phone} hint={tr("Used for WhatsApp invitations", "משמש לשליחת ההזמנה בוואטסאפ")}>
          {(f) => <Input id={f.id} invalid={f.invalid} aria-describedby={f.describedBy} value={draft.phone} onChange={(e) => set("phone", e.target.value)} type="tel" inputMode="tel" dir="ltr" placeholder="050-123-4567" />}
        </Field>
        <Field label={tr("Invitation group / family", "קבוצה / משפחה")}>
          {(f) => (
            <>
              <Input id={f.id} list="guest-groups" value={draft.group} onChange={(e) => set("group", e.target.value)} placeholder={tr("e.g. Cohen family", "למשל: משפחת כהן")} />
              <datalist id="guest-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
            </>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={tr("Category", "קטגוריה")}>
            {(f) => <Select id={f.id} value={draft.category} onChange={(e) => set("category", e.target.value as Guest["category"])}>{GUEST_CATEGORIES.map((c) => <option key={c} value={c}>{pick(CATEGORY_LABEL[c])}</option>)}</Select>}
          </Field>
          <Field label={tr("Side", "צד")}>
            {(f) => <Select id={f.id} value={draft.side} onChange={(e) => set("side", e.target.value as Guest["side"])}>{SIDES.map((s) => <option key={s} value={s}>{pick(SIDE_LABEL[s])}</option>)}</Select>}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={tr("Adults", "מבוגרים")}>
            {(f) => <Input id={f.id} type="number" min={1} max={30} value={draft.invitedAdults} onChange={(e) => set("invitedAdults", Math.max(1, Number(e.target.value) || 1))} />}
          </Field>
          <Field label={tr("Children", "ילדים")}>
            {(f) => <Input id={f.id} type="number" min={0} max={30} value={draft.invitedChildren} onChange={(e) => set("invitedChildren", Math.max(0, Number(e.target.value) || 0))} />}
          </Field>
        </div>
        <div className="flex items-end pb-3">
          <Checkbox checked={draft.plusOne} onChange={(e) => set("plusOne", e.target.checked)} label={tr("May bring a plus-one", "רשאי/ת להביא מלווה")} />
        </div>
        <Field label={tr("RSVP status", "סטטוס אישור הגעה")}>
          {(f) => <Select id={f.id} value={draft.status} onChange={(e) => set("status", e.target.value as RsvpStatus)}>{RSVP_STATUSES.map((s) => <option key={s} value={s}>{pick(STATUS_LABEL[s])}</option>)}</Select>}
        </Field>
        {draft.status === "confirmed" ? (
          <Field label={tr("Number attending", "מספר המגיעים")} hint={tr(`Up to ${maxParty(draft)}`, `עד ${maxParty(draft)}`)}>
            {(f) => <Input id={f.id} aria-describedby={f.describedBy} type="number" min={1} max={maxParty(draft)} value={draft.attendees || 1} onChange={(e) => set("attendees", Number(e.target.value) || 1)} />}
          </Field>
        ) : (
          <Field label={tr("Table", "שולחן")} optional={tr("Optional", "לא חובה")}>
            {(f) => <Input id={f.id} value={draft.table} onChange={(e) => set("table", e.target.value)} maxLength={20} />}
          </Field>
        )}
        {draft.status === "confirmed" ? (
          <Field label={tr("Table", "שולחן")} optional={tr("Optional", "לא חובה")}>
            {(f) => <Input id={f.id} value={draft.table} onChange={(e) => set("table", e.target.value)} maxLength={20} />}
          </Field>
        ) : null}
        <Field label={tr("Private notes", "הערות פרטיות")} optional={tr("Only you see this", "רק אתם רואים את זה")} className="sm:col-span-2">
          {(f) => <Textarea id={f.id} value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={2} maxLength={500} />}
        </Field>
      </form>
    </Modal>
  );
}

/* ───────────────────────── Details ───────────────────────── */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-stone">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-ink">{children}</dd>
    </div>
  );
}

export function GuestDrawer({ guest, wedding, onClose, onEdit, onReminder }: { guest: Guest | null; wedding: Wedding; onClose: () => void; onEdit: (guest: Guest) => void; onReminder: (guest: Guest) => void }) {
  const { tr, pick, locale } = useI18n();
  const { toast } = useToast();
  const [shown, setShown] = useState<Guest | null>(guest);
  useEffect(() => {
    if (guest) setShown(guest);
  }, [guest]);
  const g = shown;
  const link = g ? inviteUrl(currentOrigin(), wedding.slug, g.token) : "";
  return (
    <Drawer
      open={Boolean(guest)}
      onClose={onClose}
      title={g ? guestDisplayName(g, locale) : ""}
      footer={
        g ? (
          <>
            <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" />} onClick={() => onEdit(g)}>{tr("Edit", "עריכה")}</Button>
            <Button size="sm" icon={<MessageCircle className="size-3.5" />} disabled={!g.phone} onClick={() => onReminder(g)}>
              {g.status === "not_contacted" ? tr("Send invitation", "שליחת הזמנה") : tr("Send reminder", "שליחת תזכורת")}
            </Button>
          </>
        ) : null
      }
    >
      {g ? (
        <div>
          <StatusBadge status={g.status} />
          <dl className="mt-4 divide-y divide-line">
            <Row label={tr("Phone", "טלפון")}><span dir="ltr">{formatPhone(g.phone) || "—"}</span></Row>
            <Row label={tr("Group", "קבוצה")}>{(locale === "he" && g.groupHe) || g.group || "—"}</Row>
            <Row label={tr("Category", "קטגוריה")}>{pick(CATEGORY_LABEL[g.category])} · {pick(SIDE_LABEL[g.side])}</Row>
            <Row label={tr("Invited", "מוזמנים")}>
              {tr(`${g.invitedAdults} adults`, `${g.invitedAdults} מבוגרים`)}
              {g.invitedChildren ? tr(`, ${g.invitedChildren} children`, `, ${g.invitedChildren} ילדים`) : ""}
              {g.plusOne ? tr(" + guest", " + מלווה") : ""}
            </Row>
            <Row label={tr("Attending", "מגיעים")}>{g.status === "confirmed" ? g.attendees : "—"}</Row>
            <Row label={tr("Table", "שולחן")}>{g.table || "—"}</Row>
            <Row label={tr("Invitation sent", "ההזמנה נשלחה")}>{formatDateTime(g.invitationSentAt, locale, true)}</Row>
            <Row label={tr("Last response", "תשובה אחרונה")}>{formatDateTime(g.lastResponseAt, locale, true)}</Row>
            <Row label={tr("Reminders sent", "תזכורות שנשלחו")}>{g.remindersSent}</Row>
          </dl>
          {g.party.length ? (
            <div className="mt-5">
              <p className="eyebrow mb-2">{tr("Who is coming", "מי מגיע")}</p>
              <ul className="space-y-1.5">
                {g.party.map((m, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl bg-cream/70 px-3 py-2 text-sm">
                    <span>{m.name || tr(`Guest ${i + 1}`, `אורח ${i + 1}`)}</span>
                    <span className="text-xs text-stone">{pick(DIETARY_LABEL[m.meal])}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {[[tr("Special requests", "בקשות מיוחדות"), g.specialRequests], [tr("Message to you", "הודעה אליכם"), g.message], [tr("Private notes", "הערות פרטיות"), g.notes]].map(([label, text]) =>
            text ? (
              <div key={label} className="mt-5">
                <p className="eyebrow mb-1.5">{label}</p>
                <p className="text-sm leading-relaxed text-ink-soft" dir="auto">{text}</p>
              </div>
            ) : null,
          )}
          <div className="mt-6 rounded-2xl border border-line bg-white/70 p-3">
            <p className="eyebrow mb-1.5">{tr("Personal RSVP link", "קישור אישי לאישור הגעה")}</p>
            <p className="break-all text-xs text-stone" dir="ltr">{link}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="soft" icon={<Copy className="size-3.5" />} onClick={async () => (await copyText(link)) && toast(tr("Link copied", "הקישור הועתק"))}>{tr("Copy", "העתקה")}</Button>
              {g.phone ? (
                <a className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cream px-3.5 text-[13px] font-medium hover:bg-champagne/70" target="_blank" rel="noopener noreferrer" href={whatsappLink(g.phone, buildGuestMessage("invite", wedding, g, wedding.language, currentOrigin()))}>
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

/* ───────────────────────── Import ───────────────────────── */

export function ImportModal({ open, onClose, weddingId, existing, onImport }: { open: boolean; onClose: () => void; weddingId: string; existing: Guest[]; onImport: (guests: Guest[]) => Promise<void> }) {
  const { tr, locale } = useI18n();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<string[][] | null>(null);
  const [mapping, setMapping] = useState<Record<number, ImportField | "">>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setRows(null);
      setError("");
    }
  }, [open]);

  const load = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      const data = await readSpreadsheet(file);
      if (data.length < 2) throw new Error("empty");
      setRows(data);
      setMapping(guessMapping(data[0]));
    } catch {
      setError(tr("We could not read this file. Please use .xlsx or .csv with a header row.", "לא הצלחנו לקרוא את הקובץ. השתמשו בקובץ ‎.xlsx או ‎.csv עם שורת כותרות."));
    }
  };

  const preview = rows ? rowsToGuests(rows.slice(1), mapping, weddingId, existing) : null;
  const hasName = Object.values(mapping).includes("name");

  const run = async () => {
    if (!preview?.guests.length) return;
    setBusy(true);
    try {
      await onImport(preview.guests);
      toast(tr(`${preview.guests.length} guests imported`, `${preview.guests.length} אורחים יובאו`));
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={tr("Import guests", "ייבוא אורחים")}
      description={tr("Upload an Excel or CSV file. The first row should contain column titles.", "העלו קובץ Excel או CSV. השורה הראשונה צריכה להכיל את כותרות העמודות.")}
      footer={
        rows ? (
          <>
            <Button variant="ghost" onClick={() => setRows(null)}>{tr("Choose another file", "בחירת קובץ אחר")}</Button>
            <Button onClick={run} loading={busy} disabled={!hasName || !preview?.guests.length}>
              {tr(`Import ${preview?.guests.length ?? 0} guests`, `ייבוא ${preview?.guests.length ?? 0} אורחים`)}
            </Button>
          </>
        ) : undefined
      }
    >
      {!rows ? (
        <div>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void load(e.dataTransfer.files[0]); }}
            className="flex w-full flex-col items-center rounded-3xl border-2 border-dashed border-sand bg-cream/40 px-6 py-12 text-center transition hover:border-gold hover:bg-cream"
          >
            <Upload aria-hidden className="size-7 text-gold-deep" strokeWidth={1.5} />
            <span className="mt-3 font-serif text-2xl">{tr("Drop your file here", "גררו את הקובץ לכאן")}</span>
            <span className="mt-1 text-sm text-stone">{tr("or click to browse · .xlsx, .csv", "או לחצו לבחירה · ‎.xlsx, ‎.csv")}</span>
          </button>
          <input ref={input} type="file" accept=".xlsx,.csv,.tsv,text/csv" className="sr-only" tabIndex={-1} aria-label={tr("Choose a file", "בחירת קובץ")} onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
          {error ? <p role="alert" className="mt-3 rounded-xl bg-declined-soft px-4 py-3 text-sm text-declined-ink">{error}</p> : null}
          <button type="button" onClick={() => downloadBlob(toCsv(IMPORT_TEMPLATE), "vow-guest-template.csv")} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-deep underline-offset-4 hover:underline">
            <Download className="size-4" /> {tr("Download a template", "הורדת קובץ לדוגמה")}
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm text-stone">
            <FileSpreadsheet className="size-4" />
            {tr(`${rows.length - 1} rows found. Match each column to a field:`, `נמצאו ${rows.length - 1} שורות. התאימו כל עמודה לשדה:`)}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream/70">
                  {rows[0].map((title, i) => (
                    <th key={i} className="min-w-36 p-2 text-start align-top font-normal">
                      <p className="mb-1.5 truncate px-1 text-xs font-medium text-ink">{title || `#${i + 1}`}</p>
                      <Select compact aria-label={tr(`Field for column ${title}`, `שדה לעמודה ${title}`)} value={mapping[i] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [i]: e.target.value as ImportField | "" }))}>
                        <option value="">{tr("Skip", "דילוג")}</option>
                        {IMPORT_FIELDS.map((f) => <option key={f.field} value={f.field}>{f[locale]}</option>)}
                      </Select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1, 5).map((row, r) => (
                  <tr key={r} className="border-t border-line">
                    {rows[0].map((_, i) => <td key={i} className="max-w-44 truncate px-3 py-2 text-stone">{row[i]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone" role="status">
            {!hasName
              ? tr("Choose which column holds the guest name.", "בחרו איזו עמודה מכילה את שם האורח.")
              : tr(`${preview?.guests.length} will be added · ${preview?.skippedDuplicates} already on your list · ${preview?.skippedEmpty} without a name`, `${preview?.guests.length} יתווספו · ${preview?.skippedDuplicates} כבר ברשימה · ${preview?.skippedEmpty} ללא שם`)}
          </p>
        </div>
      )}
    </Modal>
  );
}
