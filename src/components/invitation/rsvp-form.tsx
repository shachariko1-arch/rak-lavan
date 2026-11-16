"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Minus, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Locale } from "@/lib/i18n/config";
import type { InvitationDesign } from "@/lib/invitation/schema";
import {
  DIETARY_LABELS,
  DIETARY_OPTIONS,
  rsvpSubmissionSchema,
  type RsvpErrorCode,
  type RsvpSubmission,
} from "@/lib/rsvp/schema";
import { cn } from "@/lib/utils";
import { rsvpCopy } from "./rsvp-copy";

export type ExistingResponse = RsvpSubmission & { updatedAt: string };

export type RsvpMode =
  | { kind: "live"; token: string }
  | { kind: "demo" };

type FormProps = {
  locale: Locale;
  settings: InvitationDesign["rsvp"];
  guestName: string;
  maxAttendees: number;
  existing: ExistingResponse | null;
  mode: RsvpMode;
  onDone: (response: ExistingResponse) => void;
};

/** The guest RSVP form. Shows success only after the server confirms persistence. */
export function RSVPForm({ locale, settings, guestName, maxAttendees, existing, mode, onDone }: FormProps) {
  const t = rsvpCopy[locale];
  const formId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RsvpSubmission>({
    resolver: zodResolver(rsvpSubmissionSchema) as never,
    defaultValues: existing ?? {
      attendance: undefined as unknown as RsvpSubmission["attendance"],
      attendeesCount: 1,
      companionNames: [],
      dietary: [],
      dietaryNotes: "",
      specialRequests: "",
      message: "",
    },
  });
  const attendance = useWatch({ control: form.control, name: "attendance" });
  const count = useWatch({ control: form.control, name: "attendeesCount" }) ?? 1;
  const dietary = useWatch({ control: form.control, name: "dietary" }) ?? [];

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    if (values.attendance === "attending" && values.attendeesCount > maxAttendees) {
      form.setError("attendeesCount", { message: t.errors.too_many_attendees });
      return;
    }
    if (mode.kind === "demo") {
      onDone({ ...values, updatedAt: new Date().toISOString() });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: mode.token, ...values }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; response: ExistingResponse }
        | { ok: false; error: RsvpErrorCode }
        | null;
      if (!data) throw new Error("bad_response");
      if (data.ok) {
        onDone(data.response);
      } else {
        setServerError(t.errors[data.error] ?? t.errors.server_error);
      }
    } catch {
      setServerError(navigator.onLine === false ? t.errors.network : t.errors.server_error);
    } finally {
      setSubmitting(false);
    }
  });

  const label = "mb-2 block inv-eyebrow";
  const field =
    "w-full rounded-[12px] border bg-transparent px-4 py-3 text-[15px] outline-none transition placeholder:opacity-50 focus:border-[var(--inv-accent)]";
  const fieldStyle = { borderColor: "color-mix(in srgb, var(--inv-text) 22%, transparent)", color: "var(--inv-text)" };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7" aria-describedby={serverError ? `${formId}-err` : undefined}>
      {mode.kind === "demo" && (
        <p className="rounded-[12px] px-4 py-2.5 text-center text-[13px]" style={{ background: "color-mix(in srgb, var(--inv-accent) 18%, transparent)" }}>
          {t.demoNotice}
        </p>
      )}

      <div>
        <span className={label} style={{ color: "var(--inv-text-2)" }}>
          {t.respondingAs}
        </span>
        <p className="bidi text-[20px]" style={{ fontFamily: "var(--inv-display)" }}>
          {guestName}
        </p>
      </div>

      <fieldset>
        <legend className={label} style={{ color: "var(--inv-text-2)" }}>
          {t.attendance}
        </legend>
        <Controller
          control={form.control}
          name="attendance"
          render={({ field: f }) => (
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {(["attending", "declined"] as const).map((value) => {
                const active = f.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => f.onChange(value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-[14px] border px-4 py-4 text-[15px] transition",
                      active && "shadow-[0_10px_30px_-18px_rgba(0,0,0,.6)]",
                    )}
                    style={{
                      borderColor: active ? "var(--inv-accent)" : "color-mix(in srgb, var(--inv-text) 20%, transparent)",
                      background: active ? "color-mix(in srgb, var(--inv-accent) 16%, transparent)" : "transparent",
                    }}
                  >
                    {active && (value === "attending" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />)}
                    {value === "attending" ? t.attending : t.declining}
                  </button>
                );
              })}
            </div>
          )}
        />
        {form.formState.errors.attendance && (
          <p className="mt-2 text-[13px] text-[#d45c5c]" role="alert">
            {t.errors.invalid_input}
          </p>
        )}
      </fieldset>

      <AnimatePresence initial={false}>
        {attendance === "attending" && (
          <motion.div
            key="attending-fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7 overflow-hidden"
          >
            <div>
              <span className={label} style={{ color: "var(--inv-text-2)" }} id={`${formId}-count`}>
                {t.howMany}
              </span>
              <Controller
                control={form.control}
                name="attendeesCount"
                render={({ field: f }) => (
                  <div className="flex items-center gap-4" role="group" aria-labelledby={`${formId}-count`}>
                    <button
                      type="button"
                      className="inv-button-outline grid h-11 w-11 place-items-center !p-0"
                      onClick={() => f.onChange(Math.max(1, (f.value ?? 1) - 1))}
                      aria-label="−1"
                      disabled={(f.value ?? 1) <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <output className="min-w-10 text-center text-[28px] tabular-nums" style={{ fontFamily: "var(--inv-display)" }} aria-live="polite">
                      {f.value ?? 1}
                    </output>
                    <button
                      type="button"
                      className="inv-button-outline grid h-11 w-11 place-items-center !p-0"
                      onClick={() => f.onChange(Math.min(maxAttendees, (f.value ?? 1) + 1))}
                      aria-label="+1"
                      disabled={(f.value ?? 1) >= maxAttendees}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              />
              <p className="mt-2 text-[13px]" style={{ color: "var(--inv-text-2)" }}>
                {t.maxNote(maxAttendees)}
              </p>
              {form.formState.errors.attendeesCount && (
                <p className="mt-1 text-[13px] text-[#d45c5c]" role="alert">
                  {form.formState.errors.attendeesCount.message === "min_attendees"
                    ? t.errors.min_attendees
                    : form.formState.errors.attendeesCount.message}
                </p>
              )}
            </div>

            {settings.askCompanionNames && count > 1 && (
              <div>
                <span className={label} style={{ color: "var(--inv-text-2)" }}>
                  {t.companions}
                </span>
                <div className="space-y-2.5">
                  {Array.from({ length: count - 1 }).map((_, i) => (
                    <input
                      key={i}
                      {...form.register(`companionNames.${i}` as const)}
                      className={cn(field, "bidi")}
                      style={fieldStyle}
                      placeholder={t.companionPlaceholder(i + 2)}
                      aria-label={t.companionPlaceholder(i + 2)}
                      autoComplete="off"
                      maxLength={80}
                      dir="auto"
                    />
                  ))}
                </div>
              </div>
            )}

            {settings.askDietary && (
              <fieldset>
                <legend className={label} style={{ color: "var(--inv-text-2)" }}>
                  {t.dietary}
                </legend>
                <Controller
                  control={form.control}
                  name="dietary"
                  render={({ field: f }) => (
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => {
                        const on = (f.value ?? []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => f.onChange(on ? f.value.filter((v) => v !== opt) : [...(f.value ?? []), opt])}
                            className="rounded-full border px-4 py-2 text-[14px] transition"
                            style={{
                              borderColor: on ? "var(--inv-accent)" : "color-mix(in srgb, var(--inv-text) 20%, transparent)",
                              background: on ? "color-mix(in srgb, var(--inv-accent) 18%, transparent)" : "transparent",
                            }}
                          >
                            {DIETARY_LABELS[opt][locale]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {dietary.length > 0 && (
                  <input
                    {...form.register("dietaryNotes")}
                    className={cn(field, "bidi mt-3")}
                    style={fieldStyle}
                    placeholder={t.dietaryNotes}
                    aria-label={t.dietaryNotes}
                    maxLength={300}
                    dir="auto"
                  />
                )}
              </fieldset>
            )}

            <div>
              <label className={label} style={{ color: "var(--inv-text-2)" }} htmlFor={`${formId}-req`}>
                {t.specialRequests}
              </label>
              <textarea
                id={`${formId}-req`}
                {...form.register("specialRequests")}
                rows={2}
                className={cn(field, "bidi resize-none")}
                style={fieldStyle}
                placeholder={t.specialPlaceholder}
                maxLength={600}
                dir="auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {settings.askMessage && attendance && (
        <div>
          <label className={label} style={{ color: "var(--inv-text-2)" }} htmlFor={`${formId}-msg`}>
            {t.message}
          </label>
          <textarea
            id={`${formId}-msg`}
            {...form.register("message")}
            rows={3}
            className={cn(field, "bidi resize-none")}
            style={fieldStyle}
            placeholder={t.messagePlaceholder}
            maxLength={600}
            dir="auto"
          />
        </div>
      )}

      {serverError && (
        <p id={`${formId}-err`} role="alert" className="rounded-[12px] bg-[#d45c5c]/12 px-4 py-3 text-[14px] text-[#d45c5c]">
          {serverError}
        </p>
      )}

      <button type="submit" className="inv-button flex w-full items-center justify-center gap-2" disabled={submitting || !attendance}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? t.sending : existing ? t.update : t.submit}
      </button>
    </form>
  );
}

/** Elegant confirmation after the server has saved the response. */
export function RSVPConfirmation({
  locale,
  response,
  canEdit,
  onEdit,
}: {
  locale: Locale;
  response: ExistingResponse;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const t = rsvpCopy[locale];
  const reduce = useReducedMotion();
  const yes = response.attendance === "attending";
  return (
    <div className="relative py-6 text-center" role="status">
      {yes && !reduce && <Sparkles />}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full"
        style={{ border: "1px solid var(--inv-accent)", color: "var(--inv-accent)" }}
      >
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
          <motion.path
            d={yes ? "M10 21 l7 7 l14 -16" : "M12 20 h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="inv-h2 mt-6"
      >
        {yes ? t.successTitleYes : t.successTitleNo}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="inv-body mx-auto mt-3 max-w-sm"
        style={{ color: "var(--inv-text-2)" }}
      >
        {yes ? t.successYes : t.successNo}
      </motion.p>
      <p className="mt-5 text-[13px] uppercase tracking-[0.18em]" style={{ color: "var(--inv-accent)" }}>
        {yes ? `${t.attendingShort} · ${t.guestsShort(response.attendeesCount)}` : t.decliningShort}
      </p>
      {canEdit && (
        <button type="button" onClick={onEdit} className="inv-button-outline mt-6">
          {t.editAnswer}
        </button>
      )}
    </div>
  );
}

function Sparkles() {
  const ref = useRef<HTMLDivElement>(null);
  const [pieces] = useState(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      x: Math.cos((i / 18) * Math.PI * 2) * (70 + (i % 3) * 22),
      y: Math.sin((i / 18) * Math.PI * 2) * (60 + (i % 4) * 16) - 20,
      d: 0.15 + (i % 5) * 0.05,
      s: 3 + (i % 3) * 2,
    })),
  );
  useEffect(() => {
    ref.current?.setAttribute("data-ready", "1");
  }, []);
  return (
    <div ref={ref} className="pointer-events-none absolute left-1/2 top-16 h-0 w-0" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: "var(--inv-accent)" }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.6, delay: p.d, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
