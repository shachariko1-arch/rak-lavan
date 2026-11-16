"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarPlus, Download, MapPin, Navigation } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import {
  calendarEvent,
  coupleNames,
  eventStart,
  formatTime,
  formatWeddingDate,
  fullAddress,
  googleCalendarUrl,
  mapsUrl,
  toIcs,
  wazeUrl,
} from "@/lib/invitation/facts";
import type { InvitationDesign, SectionId, WeddingFacts } from "@/lib/invitation/schema";
import { cn } from "@/lib/utils";
import { inviteCopy } from "./copy";
import { WeddingCountdown } from "./countdown";
import { PhotoGallery } from "./gallery";

type Ctx = {
  design: InvitationDesign;
  facts: WeddingFacts;
  locale: Locale;
  inviteUrl?: string;
  rsvpSlot: ReactNode;
};

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="inv-gap flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-10" style={{ background: "var(--inv-accent)", opacity: 0.55 }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--inv-accent)" }} />
      <span className="h-px w-10" style={{ background: "var(--inv-accent)", opacity: 0.55 }} />
    </div>
  );
}

function Shell({ id, children, ctx, tone = "base" }: { id: SectionId; children: ReactNode; ctx: Ctx; tone?: "base" | "surface" }) {
  const start = ctx.design.layout.alignment === "start";
  return (
    <section
      data-section={id}
      className={cn("inv-section relative", start ? "text-start" : "text-center")}
      style={tone === "surface" ? { background: "var(--inv-surface)", color: ctx.design.colors.text } : undefined}
    >
      <Reveal className={cn("mx-auto max-w-[640px]", start ? "" : "flex flex-col items-center")}>{children}</Reveal>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="inv-eyebrow mb-4" style={{ color: "var(--inv-accent)" }}>
      {children}
    </p>
  );
}

export function InvitationSection({ id, ctx }: { id: SectionId; ctx: Ctx }) {
  const { design, facts, locale } = ctx;
  const t = inviteCopy[locale];
  switch (id) {
    case "names":
      return null; // rendered by the cover
    case "photo": {
      const hero = design.photos.hero;
      if (!hero || design.layout.imagePlacement !== "inline") return null;
      return (
        <section data-section="photo" className="relative px-[clamp(16px,6cqw,48px)] pb-[clamp(24px,8cqw,64px)] pt-[clamp(24px,8cqw,64px)]">
          <Reveal className="mx-auto max-w-[720px] overflow-hidden rounded-[24px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.url}
              alt={hero.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover sm:aspect-[3/2]"
              style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%`, transform: `scale(${hero.zoom})`, transformOrigin: `${hero.focalX}% ${hero.focalY}%` }}
            />
          </Reveal>
        </section>
      );
    }
    case "intro":
      if (!design.content.intro.trim()) return null;
      return (
        <Shell id="intro" ctx={ctx}>
          <p className="inv-body bidi max-w-[34em] whitespace-pre-line" style={{ fontFamily: "var(--inv-body)", color: "var(--inv-text)" }}>
            {design.content.intro}
          </p>
          <Divider />
        </Shell>
      );
    case "date": {
      if (!facts.date) return null;
      const ev = calendarEvent(facts, locale, ctx.inviteUrl);
      return (
        <Shell id="date" ctx={ctx} tone="surface">
          <Label>{t.when}</Label>
          <h2 className="inv-h2">{formatWeddingDate(facts.date, locale)}</h2>
          {ev && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={googleCalendarUrl(ev)} target="_blank" rel="noopener noreferrer" className="inv-button-outline inline-flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" aria-hidden />
                {t.googleCalendar}
              </a>
              <button
                type="button"
                className="inv-button-outline inline-flex items-center gap-2"
                onClick={() => {
                  const blob = new Blob([toIcs(ev)], { type: "text/calendar;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "wedding.ics";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                <Download className="h-4 w-4" aria-hidden />
                {t.appleCalendar}
              </button>
            </div>
          )}
          {design.content.eventDetails.trim() && (
            <p className="inv-body bidi mt-8 max-w-[32em] whitespace-pre-line" style={{ color: "var(--inv-text-2)" }}>
              {design.content.eventDetails}
            </p>
          )}
        </Shell>
      );
    }
    case "countdown":
      if (!facts.date) return null;
      return (
        <Shell id="countdown" ctx={ctx}>
          <Label>{t.countdownTitle}</Label>
          <WeddingCountdown target={eventStart(facts)} locale={locale} className="mt-4 w-full max-w-[460px]" />
        </Shell>
      );
    case "schedule": {
      const items = [
        facts.receptionTime && { label: t.reception, time: facts.receptionTime },
        facts.ceremonyTime && { label: t.ceremony, time: facts.ceremonyTime },
      ]
        .filter(Boolean)
        .sort((a, b) => ((a as { time: string }).time < (b as { time: string }).time ? -1 : 1)) as { label: string; time: string }[];
      if (items.length === 0) return null;
      return (
        <Shell id="schedule" ctx={ctx}>
          <Label>{t.schedule}</Label>
          <div className="mt-2 grid w-full max-w-[420px] gap-px overflow-hidden rounded-[18px]" style={{ background: "color-mix(in srgb, var(--inv-text) 14%, transparent)" }}>
            {items.map((it) => (
              <div key={it.label} className="flex items-baseline justify-between gap-6 px-6 py-5" style={{ background: "var(--inv-bg)" }}>
                <span className="inv-caps inv-small" style={{ color: "var(--inv-text-2)" }}>
                  {it.label}
                </span>
                <span className="inv-date tabular-nums" style={{ fontFamily: "var(--inv-display)" }} dir="ltr">
                  {formatTime(it.time)}
                </span>
              </div>
            ))}
          </div>
        </Shell>
      );
    }
    case "venue": {
      const address = fullAddress(facts);
      if (!address) return null;
      const maps = mapsUrl(facts);
      const waze = wazeUrl(facts);
      return (
        <Shell id="venue" ctx={ctx} tone="surface">
          <Label>{t.where}</Label>
          {facts.venueName && <h2 className="inv-h2 bidi">{facts.venueName}</h2>}
          <p className="inv-body bidi mt-3" style={{ color: "var(--inv-text-2)" }}>
            {[facts.venueAddress, facts.city].filter(Boolean).join(", ")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer" className="inv-button inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {t.openInMaps}
              </a>
            )}
            {waze && (
              <a href={waze} target="_blank" rel="noopener noreferrer" className="inv-button-outline inline-flex items-center gap-2">
                <Navigation className="h-4 w-4" aria-hidden />
                {t.waze}
              </a>
            )}
          </div>
        </Shell>
      );
    }
    case "gallery":
      if (design.photos.gallery.length === 0) return null;
      return (
        <section data-section="gallery" className="inv-section">
          <Reveal className="mx-auto max-w-[920px]">
            <p className="inv-eyebrow mb-6 text-center" style={{ color: "var(--inv-accent)" }}>
              {t.gallery}
            </p>
            <PhotoGallery photos={design.photos.gallery} locale={locale} />
          </Reveal>
        </section>
      );
    case "rsvp":
      if (!design.rsvp.enabled) return null;
      return (
        <Shell id="rsvp" ctx={ctx}>
          {ctx.rsvpSlot}
        </Shell>
      );
    case "closing":
      return (
        <Shell id="closing" ctx={ctx}>
          {design.content.closing.trim() && (
            <p className="inv-body bidi italic" style={{ color: "var(--inv-text-2)", fontFamily: "var(--inv-display)" }}>
              {design.content.closing}
            </p>
          )}
          <p className="inv-h2 mt-3" style={{ fontStyle: "var(--inv-name-style)" as never }}>
            {coupleNames(facts, locale)}
          </p>
        </Shell>
      );
    default:
      return null;
  }
}
