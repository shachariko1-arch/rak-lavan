"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Check, Heart, Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Stepper, Textarea } from "@/components/ui/form";
import { RsvpError, getRepository } from "@/lib/data";
import { RSVP_LIMITS } from "@/lib/data/rsvp";
import { useI18n } from "@/lib/i18n";
import { DIETARY_LABEL } from "@/lib/labels";
import { DIETARY, maxParty } from "@/lib/types";
import type { Dietary, InvitationGuest, PartyMember, Wedding } from "@/lib/types";
import { cn, isValidPhone } from "@/lib/utils";

interface Props {
  wedding: Wedding;
  guest: InvitationGuest | null;
  onSaved: (guest: InvitationGuest) => void;
  onAddToCalendar: () => void;
}

function Burst({ colors }: { colors: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
        const distance = 90 + ((i * 37) % 80);
        return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance - 20, r: (i * 47) % 360, c: colors[i % colors.length], s: 5 + (i % 4) * 2 };
      }),
    [colors],
  );
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {pieces.map((piece, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ width: piece.s, height: piece.s * 1.6, background: piece.c }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
          animate={{ x: piece.x, y: [0, piece.y, piece.y + 60], opacity: [0, 1, 0], rotate: piece.r, scale: 1 }}
          transition={{ duration: 1.7, delay: 0.35 + (i % 5) * 0.03, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </span>
  );
}

/** The guest's reply: accept or decline, who is coming, meals, requests and a note. */
export function RsvpForm({ wedding, guest, onSaved, onAddToCalendar }: Props) {
  const { tr, pick, locale } = useI18n();
  const limit = guest ? maxParty(guest) : RSVP_LIMITS.openPartyMax;
  const answered = guest && (guest.status === "confirmed" || guest.status === "declined");
  const displayName = guest ? (locale === "he" && guest.nameHe) || guest.name : "";

  const [mode, setMode] = useState<"form" | "done">(answered ? "done" : "form");
  const [justSent, setJustSent] = useState(false);
  const [attending, setAttending] = useState<boolean | null>(answered ? guest.status === "confirmed" : null);
  const [party, setParty] = useState<PartyMember[]>(
    guest?.party.length ? guest.party : [{ name: displayName, meal: "regular" }],
  );
  const [name, setName] = useState(guest?.name ?? "");
  const [phone, setPhone] = useState(guest?.phone ?? "");
  const [requests, setRequests] = useState(guest?.specialRequests ?? "");
  const [message, setMessage] = useState(guest?.message ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const firstName = (displayName || name).trim().split(/\s+/)[0] ?? "";

  const setCount = (count: number) => {
    setParty((current) => {
      const next = current.slice(0, count);
      const adults = guest ? guest.invitedAdults + (guest.plusOne ? 1 : 0) : limit;
      while (next.length < count) {
        const child = Boolean(guest && next.length >= adults);
        next.push({ name: "", meal: child ? "kids" : "regular", ...(child ? { isChild: true } : {}) });
      }
      return next;
    });
  };
  const patch = (index: number, value: Partial<PartyMember>) =>
    setParty((current) => current.map((m, i) => (i === index ? { ...m, ...value } : m)));

  const errorText = (code: string) =>
    ({
      party_too_large: tr("That is more people than this invitation covers.", "מספר האורחים גדול ממה שההזמנה כוללת."),
      already_responded: tr("This phone number has already replied. Please use your personal link to change your answer.", "כבר התקבלה תשובה ממספר הטלפון הזה. כדי לשנות אותה, השתמשו בקישור האישי שקיבלתם."),
      phone_required: tr("Please enter a valid mobile number.", "נא להזין מספר נייד תקין."),
      deadline_passed: tr("RSVPs are closed for this wedding.", "אישורי ההגעה לאירוע נסגרו."),
      not_found: tr("We could not find this invitation.", "לא מצאנו את ההזמנה הזאת."),
      invalid: tr("Please fill in your name.", "נא למלא את שמכם."),
    })[code] ?? tr("Something went wrong. Please try again.", "משהו השתבש. נסו שוב.");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (attending === null) return;
    if (!guest && !name.trim()) return setError(errorText("invalid"));
    if (!guest && !isValidPhone(phone)) return setError(errorText("phone_required"));
    setError("");
    setSending(true);
    try {
      const members = party.map((m, i) => (i === 0 && !m.name.trim() ? { ...m, name: guest ? displayName : name } : m));
      const payload = { attending, party: attending ? members : [], specialRequests: attending ? requests : "", message };
      const repo = getRepository();
      const saved = guest
        ? await repo.submitRsvp(wedding.slug, guest.token, payload)
        : await repo.submitOpenRsvp(wedding.slug, { name, phone }, payload);
      onSaved(saved);
      setJustSent(true);
      setMode("done");
    } catch (err) {
      setError(errorText(err instanceof RsvpError ? err.code : ""));
    } finally {
      setSending(false);
    }
  };

  const surface = "rounded-[28px] border border-[color:var(--inv-line)] bg-[color:var(--inv-bg)] p-6 shadow-card sm:p-9";

  if (mode === "done" && attending !== null) {
    const count = party.length;
    return (
      <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className={cn(surface, "relative overflow-hidden text-center")}>
        <div className="relative mx-auto flex size-24 items-center justify-center">
          {justSent && attending ? <Burst colors={["var(--inv-accent)", "var(--inv-accent2)", "var(--inv-ink)"]} /> : null}
          <svg viewBox="0 0 96 96" className="absolute inset-0" fill="none" aria-hidden>
            <motion.circle cx="48" cy="48" r="44" stroke="var(--inv-accent)" strokeWidth="2" initial={{ pathLength: justSent ? 0 : 1 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} />
            {attending ? (
              <motion.path d="M30 50 L43 62 L67 36" stroke="var(--inv-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: justSent ? 0 : 1 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: justSent ? 0.7 : 0 }} />
            ) : null}
          </svg>
          {!attending ? <Heart className="size-8 text-[color:var(--inv-accent)]" strokeWidth={1.5} /> : null}
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: justSent ? 1 : 0, duration: 0.7 }}>
          <h3 className="mt-6 font-serif text-4xl leading-tight he:text-3xl">
            {attending
              ? tr(`See you there${firstName ? `, ${firstName}` : ""}`, `נתראה בחתונה${firstName ? `, ${firstName}` : ""}`)
              : tr("You will be missed", "תחסרו לנו")}
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[color:var(--inv-muted)]">
            {attending
              ? count > 1
                ? tr(`Your reply is saved: ${count} guests are confirmed.`, `התשובה נשמרה: ${count} אורחים אישרו הגעה.`)
                : tr("Your reply is saved. Your place is confirmed.", "התשובה נשמרה. המקום שלכם שמור.")
              : tr("Thank you for letting us know. Your reply is saved.", "תודה שעדכנתם. התשובה נשמרה.")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {attending ? (
              <Button variant="primary" icon={<CalendarPlus className="size-4" />} onClick={onAddToCalendar}>
                {tr("Add to calendar", "הוספה ליומן")}
              </Button>
            ) : null}
            <Button variant="outline" icon={<Pencil className="size-4" />} onClick={() => { setJustSent(false); setMode("form"); }}>
              {tr("Change my reply", "שינוי התשובה")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className={surface} noValidate>
      {wedding.rsvpDeadline ? null : null}
      <fieldset>
        <legend className="sr-only">{tr("Will you attend?", "האם תגיעו?")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            [true, tr("Joyfully accept", "מגיעים בשמחה"), Check],
            [false, tr("Regretfully decline", "לצערנו לא נגיע"), X],
          ] as const).map(([value, label, Icon]) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={attending === value}
              onClick={() => setAttending(value)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-5 py-4 text-start transition-all duration-300",
                attending === value
                  ? "border-[color:var(--inv-ink)] bg-[color:var(--inv-ink)] text-[color:var(--inv-bg)] shadow-lift"
                  : "border-[color:var(--inv-line)] hover:border-[color:var(--inv-accent)]",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-current/30">
                <Icon className="size-4" />
              </span>
              <span className="font-serif text-xl he:text-lg">{label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <AnimatePresence initial={false}>
        {attending !== null ? (
          <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="space-y-5 pt-7">
              {!guest ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={tr("Your full name", "שם מלא")}>
                    {(f) => <Input id={f.id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required />}
                  </Field>
                  <Field label={tr("Mobile number", "טלפון נייד")}>
                    {(f) => <Input id={f.id} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="050-123-4567" required />}
                  </Field>
                </div>
              ) : null}

              {attending ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{tr("How many are coming?", "כמה תגיעו?")}</p>
                      <p className="text-xs text-[color:var(--inv-muted)]">
                        {tr(`This invitation is for up to ${limit}`, `ההזמנה מיועדת לעד ${limit} אורחים`)}
                      </p>
                    </div>
                    <Stepper value={party.length} onChange={setCount} min={1} max={limit} label={tr("Number of guests", "מספר אורחים")} decreaseLabel={tr("One fewer", "אחד פחות")} increaseLabel={tr("One more", "אחד נוסף")} />
                  </div>
                  <ul className="space-y-2.5">
                    {party.map((member, index) => (
                      <li key={index} className="grid grid-cols-[1fr_9.5rem] gap-2.5">
                        <Input
                          aria-label={tr(`Guest ${index + 1} name`, `שם אורח ${index + 1}`)}
                          placeholder={index === 0 ? tr("Your name", "השם שלך") : tr(`Guest ${index + 1} name`, `שם אורח ${index + 1}`)}
                          value={member.name}
                          maxLength={80}
                          onChange={(e) => patch(index, { name: e.target.value })}
                        />
                        <Select aria-label={tr(`Guest ${index + 1} meal`, `מנה לאורח ${index + 1}`)} value={member.meal} onChange={(e) => patch(index, { meal: e.target.value as Dietary, isChild: e.target.value === "kids" || undefined })}>
                          {DIETARY.map((d) => (
                            <option key={d} value={d}>{pick(DIETARY_LABEL[d])}</option>
                          ))}
                        </Select>
                      </li>
                    ))}
                  </ul>
                  <Field label={tr("Special requests", "בקשות מיוחדות")} optional={tr("Optional", "לא חובה")} hint={tr("Allergies, accessibility, a high chair…", "אלרגיות, נגישות, כיסא תינוק…")}>
                    {(f) => <Textarea id={f.id} aria-describedby={f.describedBy} value={requests} onChange={(e) => setRequests(e.target.value)} maxLength={500} rows={2} />}
                  </Field>
                </>
              ) : null}

              <Field label={tr("A note for the couple", "כמה מילים לזוג")} optional={tr("Optional", "לא חובה")}>
                {(f) => <Textarea id={f.id} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} />}
              </Field>

              {error ? <p role="alert" className="rounded-xl bg-declined-soft px-4 py-3 text-sm text-declined-ink">{error}</p> : null}

              <Button type="submit" size="lg" loading={sending} className="w-full !bg-[color:var(--inv-ink)] !text-[color:var(--inv-bg)]">
                {tr("Send reply", "שליחת התשובה")}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
