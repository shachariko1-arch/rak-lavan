"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { coupleInitials } from "@/lib/invitation/facts";
import { orderedSections, type GuestPersonalization, type InvitationDesign, type WeddingFacts } from "@/lib/invitation/schema";
import { cn } from "@/lib/utils";
import { inviteCopy } from "./copy";
import { InvitationCover } from "./cover";
import { OpeningOverlay } from "./opening";
import { RSVPConfirmation, RSVPForm, type ExistingResponse } from "./rsvp-form";
import { rsvpCopy } from "./rsvp-copy";
import { InvitationSection } from "./sections";
import { themeVars } from "./theme";

export type RsvpConfig =
  | {
      kind: "live";
      token: string;
      guestName: string;
      maxAttendees: number;
      existing: ExistingResponse | null;
      canUpdate: boolean;
      deadlinePassed: boolean;
    }
  | { kind: "demo"; guestName: string; maxAttendees: number }
  | { kind: "public" }
  | { kind: "closed" };

type Props = {
  design: InvitationDesign;
  facts: WeddingFacts;
  guest?: GuestPersonalization | null;
  rsvp: RsvpConfig;
  inviteUrl?: string;
  /** Render inside a frame (editor canvas, marketing demo) instead of full screen. */
  contained?: boolean;
  showOpening?: boolean;
  /** Key that, when changed, replays the opening. */
  replayKey?: number;
  onTrack?: (event: "rsvp_started") => void;
  className?: string;
};

/** The complete guest-facing invitation, rendered purely from validated design data. */
export function InvitationExperience({
  design,
  facts,
  guest,
  rsvp,
  inviteUrl,
  contained = false,
  showOpening = true,
  replayKey = 0,
  onTrack,
  className,
}: Props) {
  const locale = design.language as Locale;
  const [opened, setOpened] = useState(!showOpening);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [response, setResponse] = useState<ExistingResponse | null>(rsvp.kind === "live" ? rsvp.existing : null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpened(!showOpening);
  }, [replayKey, showOpening]);

  const startMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el || !design.music.enabled || !design.music.url) return;
    el.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [design.music.enabled, design.music.url]);

  const toggleMusic = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) startMusic();
    else {
      el.pause();
      setPlaying(false);
    }
  };

  const openRsvp = () => {
    setShowConfirmation(false);
    setRsvpOpen(true);
    onTrack?.("rsvp_started");
  };

  const t = inviteCopy[locale];
  const r = rsvpCopy[locale];
  const sections = orderedSections(design);

  const rsvpSlot = (
    <RsvpCallToAction
      locale={locale}
      design={design}
      rsvp={rsvp}
      response={response}
      onOpen={openRsvp}
    />
  );

  return (
    <div
      ref={rootRef}
      className={cn("inv-root relative", contained ? "h-full overflow-y-auto overflow-x-hidden" : "min-h-dvh", className)}
      style={themeVars(design)}
      dir={locale === "he" ? "rtl" : "ltr"}
      lang={locale}
    >
      <div className={cn("relative", contained ? "min-h-full" : "min-h-dvh")}>
        <InvitationCover
          design={design}
          facts={facts}
          guest={guest}
          revealed={opened}
          priority
          className={contained ? "min-h-[100cqh]" : "min-h-dvh"}
        />
      </div>

      {sections.map((id) => (
        <InvitationSection key={id} id={id} ctx={{ design, facts, locale, inviteUrl, rsvpSlot }} />
      ))}

      <footer className="flex flex-col items-center gap-3 pb-10 pt-4 text-center">
        {showOpening && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12px] opacity-60 transition hover:opacity-100"
            onClick={() => {
              setOpened(false);
              rootRef.current?.scrollTo({ top: 0 });
              if (!contained) window.scrollTo({ top: 0 });
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {t.replay}
          </button>
        )}
        <a href="/" className="text-[11px] uppercase tracking-[0.3em] opacity-45 transition hover:opacity-80" target="_blank" rel="noopener">
          Made with VOW
        </a>
      </footer>

      {design.music.enabled && design.music.url && (
        <>
          <audio ref={audioRef} src={design.music.url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            className={cn(
              "z-40 grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md transition",
              contained ? "absolute bottom-4 end-4" : "fixed bottom-5 end-5",
            )}
            style={{ borderColor: "color-mix(in srgb, var(--inv-text) 25%, transparent)", background: "color-mix(in srgb, var(--inv-bg) 60%, transparent)", color: "var(--inv-text)" }}
            aria-label={playing ? t.pauseMusic : t.playMusic}
            aria-pressed={playing}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </>
      )}

      <AnimatePresence>
        {!opened && (
          <OpeningOverlay
            key={`opening-${replayKey}`}
            kind={design.animation.opening}
            design={design}
            initials={coupleInitials(facts)}
            locale={locale}
            contained={contained}
            onInteract={startMusic}
            onOpened={() => setOpened(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rsvpOpen && (rsvp.kind === "live" || rsvp.kind === "demo") && (
          <RsvpDialog
            contained={contained}
            title={design.content.rsvpPrompt || r.title}
            closeLabel={t.close}
            onClose={() => setRsvpOpen(false)}
          >
            {showConfirmation && response ? (
              <RSVPConfirmation
                locale={locale}
                response={response}
                canEdit={rsvp.kind === "demo" || (rsvp.kind === "live" && rsvp.canUpdate && !rsvp.deadlinePassed)}
                onEdit={() => setShowConfirmation(false)}
              />
            ) : (
              <RSVPForm
                locale={locale}
                settings={design.rsvp}
                guestName={rsvp.guestName}
                maxAttendees={rsvp.maxAttendees}
                existing={response}
                mode={rsvp.kind === "live" ? { kind: "live", token: rsvp.token } : { kind: "demo" }}
                onDone={(res) => {
                  setResponse(res);
                  setShowConfirmation(true);
                }}
              />
            )}
          </RsvpDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function RsvpCallToAction({
  locale,
  design,
  rsvp,
  response,
  onOpen,
}: {
  locale: Locale;
  design: InvitationDesign;
  rsvp: RsvpConfig;
  response: ExistingResponse | null;
  onOpen: () => void;
}) {
  const t = inviteCopy[locale];
  const r = rsvpCopy[locale];
  const deadline = design.rsvp.deadline
    ? new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(`${design.rsvp.deadline}T00:00:00Z`),
      )
    : null;

  return (
    <>
      <p className="inv-eyebrow mb-4" style={{ color: "var(--inv-accent)" }}>
        RSVP
      </p>
      <h2 className="inv-h2 bidi">{design.content.rsvpPrompt || t.rsvpTitle}</h2>
      {deadline && rsvp.kind !== "closed" && (
        <p className="inv-small mt-3" style={{ color: "var(--inv-text-2)" }}>
          {t.rsvpDeadline(deadline)}
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-4">
        {rsvp.kind === "public" && (
          <p className="inv-body max-w-sm" style={{ color: "var(--inv-text-2)" }}>
            {t.rsvpPersonalLinkNeeded}
          </p>
        )}
        {rsvp.kind === "closed" && (
          <p className="inv-body max-w-sm" style={{ color: "var(--inv-text-2)" }}>
            {t.rsvpClosed}
          </p>
        )}
        {rsvp.kind === "live" && rsvp.deadlinePassed && !response && (
          <p className="inv-body max-w-sm" style={{ color: "var(--inv-text-2)" }}>
            {r.errors.deadline_passed}
          </p>
        )}
        {(rsvp.kind === "live" || rsvp.kind === "demo") && response && (
          <div className="rounded-[18px] border px-6 py-4" style={{ borderColor: "color-mix(in srgb, var(--inv-accent) 50%, transparent)" }}>
            <p className="inv-eyebrow" style={{ color: "var(--inv-text-2)" }}>
              {r.previousAnswer}
            </p>
            <p className="mt-1 text-[18px]" style={{ fontFamily: "var(--inv-display)" }}>
              {response.attendance === "attending" ? `${r.attendingShort} · ${r.guestsShort(response.attendeesCount)}` : r.decliningShort}
            </p>
          </div>
        )}
        {(rsvp.kind === "demo" ||
          (rsvp.kind === "live" && !rsvp.deadlinePassed && (!response || rsvp.canUpdate))) && (
          <button type="button" className="inv-button" onClick={onOpen}>
            {response ? t.updateResponse : t.confirm}
          </button>
        )}
      </div>
    </>
  );
}

function RsvpDialog({
  children,
  title,
  closeLabel,
  onClose,
  contained,
}: {
  children: React.ReactNode;
  title: string;
  closeLabel: string;
  onClose: () => void;
  contained: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className={cn("z-[70] flex items-end justify-center sm:items-center", contained ? "absolute inset-0" : "fixed inset-0")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[92%] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] px-6 pb-8 pt-7 outline-none sm:rounded-[28px] sm:px-9"
        style={{ background: "var(--inv-surface)", color: "var(--inv-text)" }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="inv-h2 !text-[clamp(1.6rem,6cqw,2.2rem)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-black/5"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
