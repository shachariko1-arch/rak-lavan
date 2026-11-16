"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CalendarPlus, ChevronDown, Clock, Globe, MapPin, Navigation } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { googleCalendarUrl, googleMapsUrl, icsFile, wazeUrl } from "@/lib/calendar";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { coupleNames } from "@/lib/messaging/templates";
import { getTemplate, paletteVars, resolvePalette } from "@/lib/templates";
import type { InvitationGuest, Locale, Wedding } from "@/lib/types";
import { downloadBlob, formatWeddingDate, hebrewCalendarDate, weddingMoment } from "@/lib/utils";
import { InvitationCard } from "./card";
import { CARD_WIDTH, Envelope } from "./envelope";
import { Particles } from "./particles";
import { RsvpForm } from "./rsvp";

const EASE = [0.22, 1, 0.36, 1] as const;

function Countdown({ target }: { target: Date }) {
  const { tr } = useI18n();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = now === null ? 0 : Math.max(0, target.getTime() - now);
  const units: [number, string][] = [
    [Math.floor(diff / 86400000), tr("Days", "ימים")],
    [Math.floor(diff / 3600000) % 24, tr("Hours", "שעות")],
    [Math.floor(diff / 60000) % 60, tr("Minutes", "דקות")],
    [Math.floor(diff / 1000) % 60, tr("Seconds", "שניות")],
  ];
  if (now !== null && diff === 0) {
    return <p className="font-serif text-4xl">{tr("Today is the day", "היום זה קורה")}</p>;
  }
  return (
    <div dir="ltr" className="flex items-start justify-center gap-3 sm:gap-6" role="timer" aria-live="off">
      {units.map(([value, label]) => (
        <div key={label} className="w-[4.6rem] sm:w-28">
          <div className="relative h-16 overflow-hidden font-serif text-5xl leading-[4rem] sm:h-24 sm:text-7xl sm:leading-[6rem]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={value} className="tabular absolute inset-0 text-center" initial={{ y: "60%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-60%", opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                {now === null ? "–" : String(value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="eyebrow mt-2 !text-[color:var(--inv-muted)]">{label}</p>
        </div>
      ))}
    </div>
  );
}

/** Words light up one after another as the paragraph scrolls through the viewport. */
function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-serif text-[28px] leading-[1.35] sm:text-[40px] he:text-[25px] he:leading-[1.55] sm:he:text-[34px]">
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }: { children: string; progress: ReturnType<typeof useScroll>["scrollYProgress"]; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

function Slideshow({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  useEffect(() => {
    if (photos.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), 4800);
    return () => window.clearInterval(id);
  }, [photos.length]);
  return (
    <div ref={ref} className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] shadow-lift">
      <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y }}>
        <AnimatePresence>
          <motion.img key={photos[index]} src={photos[index]} alt="" className="absolute inset-0 size-full object-cover" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 1.4 }, scale: { duration: 6, ease: "linear" } }} />
        </AnimatePresence>
      </motion.div>
      {photos.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
          {photos.map((src, i) => (
            <button key={src} type="button" aria-label={`${i + 1} / ${photos.length}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full bg-white transition-all duration-500 ${i === index ? "w-6 opacity-100" : "w-1.5 opacity-60"}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Section({ children, className = "", soft }: { children: React.ReactNode; className?: string; soft?: boolean }) {
  return (
    <section className={`relative px-6 py-20 sm:py-28 ${className}`} style={{ background: soft ? "var(--inv-soft)" : "var(--inv-bg)" }}>
      <motion.div className="mx-auto max-w-3xl" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ duration: 1, ease: EASE }}>
        {children}
      </motion.div>
    </section>
  );
}

interface ViewProps {
  wedding: Wedding;
  guest: InvitationGuest | null;
  onGuest: (guest: InvitationGuest) => void;
  onLocale: (locale: Locale) => void;
  /** Skip the envelope (design previews). */
  preview?: boolean;
}

function View({ wedding, guest, onGuest, onLocale, preview }: ViewProps) {
  const { tr, locale, pick } = useI18n();
  const [opened, setOpened] = useState(Boolean(preview));
  const template = getTemplate(wedding.templateId);
  const p = resolvePalette(wedding.palette);
  const couple = coupleNames(wedding, locale);
  const guestName = guest ? (locale === "he" && guest.nameHe) || guest.name : "";
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const done = useCallback(() => setOpened(true), []);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => void (document.documentElement.style.overflow = "");
  }, [opened]);

  const addIcs = () => downloadBlob(icsFile(wedding, locale), `${wedding.slug}.ics`);
  const canRsvp = Boolean(guest) || wedding.allowOpenRsvp;
  const card = <InvitationCard wedding={wedding} locale={locale} />;

  return (
    <div style={{ ...(paletteVars(wedding.palette) as CSSProperties), background: "var(--inv-bg)", color: "var(--inv-ink)" }} className="min-h-svh">
      <AnimatePresence>
        {!opened ? (
          <Envelope
            key="envelope"
            palette={wedding.palette}
            initials={[Array.from(pick(wedding.bride))[0] ?? "", Array.from(pick(wedding.groom))[0] ?? ""]}
            greeting={guestName ? tr(`For ${guestName}`, `עבור ${guestName}`) : tr("You are invited", "הוזמנתם")}
            hint={tr("Tap the seal to open", "הקישו על החותם לפתיחה")}
            skipLabel={tr("Skip the animation", "דילוג על האנימציה")}
            card={<InvitationCard wedding={wedding} locale={locale} />}
            onDone={done}
          />
        ) : null}
      </AnimatePresence>

      <div className="fixed end-3 top-3 z-40">
        <button type="button" onClick={() => onLocale(locale === "he" ? "en" : "he")} className="glass inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink shadow-card">
          <Globe aria-hidden className="size-4 opacity-70" />
          <span lang={locale === "he" ? "en" : "he"}>{locale === "he" ? "English" : "עברית"}</span>
        </button>
      </div>

      <main id="main">
        {/* Hero */}
        <section ref={heroRef} className="relative flex h-svh min-h-[560px] items-center justify-center overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 20%, ${p.bg}, ${p.soft})` }}>
          <motion.div aria-hidden className="absolute left-1/2 top-[18%] size-[70vmin] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ y: glowY, background: `radial-gradient(circle, ${p.accent2}, transparent 65%)` }} />
          <Particles kind={template.particles} colors={[p.accent, p.accent2, p.dark ? p.ink : p.accent]} />
          <motion.div style={{ width: CARD_WIDTH, y: cardY }} className="relative">
            <h1 className="sr-only">{tr(`${couple}: wedding invitation`, `הזמנה לחתונה של ${couple}`)}</h1>
            <div className={opened ? "animate-float-slow" : ""}>{card}</div>
          </motion.div>
          <motion.a href="#story" aria-label={tr("Scroll down", "גלילה למטה")} className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[color:var(--inv-muted)]" animate={{ y: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <ChevronDown className="size-6" />
          </motion.a>
        </section>

        {/* Story */}
        <Section className="scroll-mt-0 text-center">
          <div id="story" className="-mt-24 pt-24" />
          {guestName ? <p className="eyebrow mb-6 !text-[color:var(--inv-accent-text)]">{tr(`Dear ${guestName}`, `${guestName} היקרים`)}</p> : <p className="eyebrow mb-6 !text-[color:var(--inv-accent-text)]">{tr("Our story", "הסיפור שלנו")}</p>}
          <ScrollText text={pick(wedding.intro) || tr(`${couple} are getting married, and would love you to be there.`, `${couple} מתחתנים, ונשמח מאוד שתהיו שם.`)} />
          {wedding.personalMessage ? <p className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-[color:var(--inv-muted)]">{wedding.personalMessage}</p> : null}
          <p className="mt-8 font-serif text-2xl italic text-[color:var(--inv-accent-text)] he:not-italic">{couple}</p>
        </Section>

        {wedding.photos.length ? (
          <Section soft>
            <Slideshow photos={wedding.photos} />
          </Section>
        ) : null}

        {/* Countdown */}
        <Section className="text-center">
          <p className="eyebrow mb-8 !text-[color:var(--inv-accent-text)]">{tr("Counting down", "סופרים לאחור")}</p>
          <Countdown target={weddingMoment(wedding.date, wedding.ceremonyTime)} />
        </Section>

        {/* Details */}
        <Section soft className="text-center">
          <p className="eyebrow mb-4 !text-[color:var(--inv-accent-text)]">{tr("The day", "היום הגדול")}</p>
          <h2 className="font-serif text-4xl leading-tight sm:text-5xl he:text-3xl">{formatWeddingDate(wedding.date, locale, "long")}</h2>
          {locale === "he" ? <p className="mt-2 text-[color:var(--inv-muted)]">{hebrewCalendarDate(wedding.date)}</p> : null}
          <div className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            {([[tr("Reception", "קבלת פנים"), wedding.receptionTime], [tr("Ceremony", "חופה וקידושין"), wedding.ceremonyTime]] as const).map(([label, time]) => (
              <div key={label} className="rounded-3xl border border-[color:var(--inv-line)] bg-[color:var(--inv-bg)] p-6">
                <Clock aria-hidden className="mx-auto size-5 text-[color:var(--inv-accent)]" strokeWidth={1.5} />
                <p className="eyebrow mt-3 !text-[color:var(--inv-muted)]">{label}</p>
                <p className="tabular mt-1 font-serif text-4xl" dir="ltr">{time}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <MapPin aria-hidden className="mx-auto size-5 text-[color:var(--inv-accent)]" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-3xl he:text-2xl">{pick(wedding.venue)}</p>
            <p className="mt-1 text-[color:var(--inv-muted)]">{pick(wedding.address)}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <a href={googleMapsUrl(wedding, locale)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--inv-ink)] px-5 text-sm font-medium text-[color:var(--inv-bg)] transition hover:opacity-90">
              <MapPin className="size-4" /> {tr("Open in Maps", "פתיחה במפות")}
            </a>
            <a href={wazeUrl(wedding, locale)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--inv-line)] bg-[color:var(--inv-bg)] px-5 text-sm font-medium transition hover:border-[color:var(--inv-accent)]">
              <Navigation className="size-4" /> Waze
            </a>
            <Menu
              align="start"
              trigger={(props) => (
                <button type="button" {...props} className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--inv-line)] bg-[color:var(--inv-bg)] px-5 text-sm font-medium transition hover:border-[color:var(--inv-accent)]">
                  <CalendarPlus className="size-4" /> {tr("Add to calendar", "הוספה ליומן")}
                </button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { window.open(googleCalendarUrl(wedding, locale), "_blank", "noopener"); close(); }}>Google Calendar</MenuItem>
                  <MenuItem onSelect={() => { addIcs(); close(); }}>{tr("Apple / Outlook (.ics)", "Apple / Outlook (‎.ics)")}</MenuItem>
                </>
              )}
            </Menu>
          </div>
        </Section>

        {/* RSVP */}
        <Section className="scroll-mt-4">
          <div id="rsvp" className="-mt-20 pt-20" />
          <div className="mb-8 text-center">
            <p className="eyebrow mb-4 !text-[color:var(--inv-accent-text)]">RSVP</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl he:text-3xl">{guestName ? tr(`${guestName.split(" ")[0]}, will you join us?`, `${guestName.split(" ")[0]}, תבואו לחגוג איתנו?`) : tr("Will you join us?", "תבואו לחגוג איתנו?")}</h2>
            {wedding.rsvpDeadline ? <p className="mt-3 text-sm text-[color:var(--inv-muted)]">{tr("Kindly reply by", "נשמח לתשובה עד")} {formatWeddingDate(wedding.rsvpDeadline, locale, "medium")}</p> : null}
          </div>
          {canRsvp ? (
            <RsvpForm key={`${guest?.id ?? "open"}-${locale}`} wedding={wedding} guest={guest} onSaved={onGuest} onAddToCalendar={addIcs} />
          ) : (
            <p className="rounded-3xl border border-[color:var(--inv-line)] p-8 text-center text-[color:var(--inv-muted)]">{tr("To reply, please open the personal link the couple sent you.", "כדי לאשר הגעה, פתחו את הקישור האישי שקיבלתם מבני הזוג.")}</p>
          )}
        </Section>

        <footer className="px-6 pb-28 pt-6 text-center" style={{ background: "var(--inv-bg)" }}>
          <p className="font-serif text-2xl italic he:not-italic">{tr("With love,", "באהבה,")} {couple}</p>
          <p className="mt-6 text-xs tracking-[0.2em] text-[color:var(--inv-muted)]"><span dir="ltr">MADE WITH VOW</span></p>
        </footer>
      </main>

      {opened && canRsvp && !preview ? (
        <motion.a href="#rsvp" initial={{ y: 80 }} animate={{ y: 0 }} transition={{ delay: 1.2, duration: 0.7, ease: EASE }} className="fixed inset-x-4 bottom-4 z-30 mx-auto flex h-12 max-w-xs items-center justify-center rounded-full bg-[color:var(--inv-ink)] text-sm font-medium text-[color:var(--inv-bg)] shadow-lift sm:hidden">
          {guest?.status === "confirmed" || guest?.status === "declined" ? tr("View my reply", "התשובה שלי") : tr("RSVP", "אישור הגעה")}
        </motion.a>
      ) : null}
    </div>
  );
}

/** The guest-facing invitation, in its own language context. */
export function InviteView(props: Omit<ViewProps, "onLocale"> & { locale: Locale; onLocale: (locale: Locale) => void }) {
  const { locale, ...rest } = props;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  return (
    <I18nProvider locale={locale}>
      <div lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
        <View {...rest} />
      </div>
    </I18nProvider>
  );
}
