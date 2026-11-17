"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight, Check, Clapperboard, Link2, MessageCircle, Plus, Users, Wand2 } from "lucide-react";
import { useId, useState } from "react";
import { InvitationThumbnail } from "@/components/invitation/thumbnail";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";
import { DEMO_FACTS } from "@/lib/invitation/facts";
import { designFromTemplate, getTemplate } from "@/lib/invitation/templates";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "./section";
import { useMarketing } from "./use-marketing";

const ICONS = [Wand2, Clapperboard, Link2, Activity, Users, MessageCircle];

/* --------------------------------------------------------------- Features */

export function Features({ withHeading = true }: { withHeading?: boolean }) {
  const t = useMarketing();
  const { locale } = useLocale();
  return (
    <section className="relative py-24 sm:py-32" id="features">
      <Container>
        {withHeading && <SectionHeading eyebrow={t.features.eyebrow} title={t.features.title} />}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-white/[.08] bg-white/[.07] md:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.08} className={cn("group relative flex flex-col p-7 sm:p-9", i % 2 === 0 ? "bg-night" : "bg-night-2")}>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-champagne/30 text-champagne transition group-hover:bg-champagne group-hover:text-night">
                  <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden />
                </span>
                <h3 className="mt-7 font-display text-[28px] leading-tight text-pearl">{f.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{f.text}</p>
                <div className="mt-8 h-40 overflow-hidden rounded-[14px] border border-white/[.07] bg-surface/60">
                  <FeatureVisual index={i} locale={locale} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function FeatureVisual({ index, locale }: { index: number; locale: "en" | "he" }) {
  if (index === 0 || index === 1) {
    const slug = index === 0 ? "editorial-romance" : "jerusalem-stone";
    return (
      <div className="flex h-full items-center justify-center gap-3 p-4">
        {[0, 1].map((k) => (
          <motion.div key={k} className="w-[30%] overflow-hidden rounded-[8px]" initial={{ y: 20, opacity: 0 }} whileInView={{ y: k ? 10 : 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + k * 0.2 }}>
            <InvitationThumbnail design={designFromTemplate(getTemplate(k ? slug : "midnight-elegance")!, locale)} facts={DEMO_FACTS[locale]} />
          </motion.div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="flex h-full flex-col justify-center gap-2 px-5 font-mono text-[12px]" dir="ltr">
        {["Maya", "Daniel", "Yael"].map((n, i) => (
          <motion.div key={n} className="flex items-center justify-between rounded-[8px] bg-night/70 px-3 py-2 text-mist" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
            <span>vow.app/invite/<span className="text-champagne">{["m7Kq", "d2Lp", "y9Xa"][i]}…</span></span>
            <span className="text-pearl">{n}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  if (index === 3) {
    const bars = [40, 62, 48, 80, 70, 96, 88];
    return (
      <div className="flex h-full items-end gap-2 px-5 pb-5 pt-8">
        {bars.map((h, i) => (
          <motion.span key={i} className="flex-1 rounded-t-[4px] bg-gradient-to-t from-gold/30 to-champagne" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.8 }} />
        ))}
      </div>
    );
  }
  if (index === 4) {
    return (
      <div className="grid h-full grid-cols-2 content-center gap-2 p-5 text-[12px]">
        {[
          ["Bride's family", 86],
          ["Groom's family", 74],
          ["Friends", 112],
          ["Work", 38],
        ].map(([g, n]) => (
          <div key={g} className="rounded-[8px] bg-night/70 px-3 py-2">
            <span className="block text-smoke">{g}</span>
            <span className="font-display text-[20px] text-pearl">{n}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5">
      <div className="max-w-[80%] rounded-[10px] rounded-ss-[2px] bg-[#005c4b] px-3 py-2 text-[12px] text-white">Hi Maya! 💛 vow.app/invite/m7Kq…</div>
      <div className="ms-auto rounded-[10px] bg-[#202c33] px-3 py-2 text-[12px] text-white">We&apos;ll be there 🥂</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Pricing */

export function Pricing({ withHeading = true, showFaq = true }: { withHeading?: boolean; showFaq?: boolean }) {
  const t = useMarketing();
  return (
    <section className="relative bg-night-2 py-24 sm:py-32" id="pricing">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_30%,rgba(217,185,139,.08),transparent)]" />
      <Container className="relative">
        {withHeading && <SectionHeading eyebrow={t.pricing.eyebrow} title={t.pricing.title} description={t.pricing.description} align="center" />}
        <Stagger className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {t.pricing.plans.map((p) => {
            const featured = p.id === "premium";
            return (
              <StaggerItem
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-[24px] border p-8 sm:p-10",
                  featured ? "border-champagne/55 bg-[linear-gradient(180deg,rgba(217,185,139,.12),rgba(21,22,27,.9)_45%)] shadow-[0_40px_90px_-50px_rgba(217,185,139,.6)] lg:-my-4 lg:py-14" : "border-white/[.09] bg-surface/70",
                )}
              >
                {featured && <span className="absolute -top-3 start-8 rounded-full bg-champagne px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-night">{t.pricing.recommended}</span>}
                <h3 className="font-display text-[30px] text-pearl">{p.name}</h3>
                <p className="mt-1 text-[14px] text-mist">{p.tagline}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-[60px] leading-none text-pearl tabular-nums">₪{p.price}</span>
                  <span className="text-[13px] text-smoke">{t.pricing.oneTime}</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14.5px] text-pearl/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={`/register?plan=${p.id}`} variant={featured ? "champagne" : "outline"} size="lg" className="mt-10 w-full">
                  {p.cta}
                </ButtonLink>
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mt-8 text-center text-[12.5px] text-smoke">{t.pricing.currencyNote}</p>
        {showFaq && (
          <div className="mx-auto mt-20 max-w-3xl">
            <h3 className="mb-6 text-center font-display text-[30px] text-pearl">{t.pricing.faqTitle}</h3>
            <Accordion items={t.pricing.faq} />
          </div>
        )}
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------- Testimonials */

export function Testimonials() {
  const t = useMarketing();
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
        <p className="mt-4 text-[12.5px] text-smoke">{t.testimonials.demoLabel}</p>
        <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
          {t.testimonials.items.map((it, i) => (
            <StaggerItem key={it.names} className={cn("relative rounded-[24px] bg-ivory p-8 text-[#1d1a16] sm:p-10", i === 1 && "lg:translate-y-10")}>
              <span className="font-display text-[90px] leading-[0.6] text-gold" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="mt-4 font-display text-[23px] leading-[1.35]">{it.quote}</blockquote>
              <footer className="mt-8 border-t border-black/10 pt-5">
                <p className="font-medium">{it.names}</p>
                <p className="text-[13px] text-black/55">{it.date}</p>
              </footer>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="divide-y divide-white/[.08] border-y border-white/[.08]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-start text-[17px] text-pearl transition hover:text-champagne-light sm:text-[19px]"
              >
                {it.q}
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.35 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-champagne">
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-a${i}`}
                  role="region"
                  aria-labelledby={`${id}-q${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-[15.5px] leading-relaxed text-mist">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function FAQ({ withHeading = true }: { withHeading?: boolean }) {
  const t = useMarketing();
  return (
    <section className="relative bg-night-2 py-24 sm:py-32" id="faq">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        {withHeading && <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />}
        <Accordion items={t.faq.items} />
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- Final CTA */

export function FinalCTA() {
  const t = useMarketing();
  const { locale } = useLocale();
  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(217,185,139,.22),transparent_60%),linear-gradient(180deg,#08090d,#0f0d0b)]" />
      <div className="grain absolute inset-0 -z-10" />
      {["botanical-romance", "midnight-elegance", "mediterranean-sunset"].map((slug, i) => (
        <motion.div
          key={slug}
          aria-hidden
          className={cn("absolute -z-10 hidden w-[180px] overflow-hidden rounded-[18px] opacity-50 shadow-[var(--shadow-float)] md:block", ["start-[6%] top-[14%] -rotate-12", "end-[8%] top-[10%] rotate-[9deg]", "bottom-[8%] end-[22%] rotate-[-5deg]"][i])}
          animate={{ y: [0, i % 2 ? 12 : -12, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <InvitationThumbnail design={designFromTemplate(getTemplate(slug)!, locale)} facts={DEMO_FACTS[locale]} />
        </motion.div>
      ))}
      <Container className="text-center">
        <SectionHeading title={t.cta.title} description={t.cta.description} align="center" />
        <Reveal delay={0.3} className="mt-10">
          <ButtonLink href="/register" size="lg" iconEnd={<ArrowRight className="h-4 w-4 rtl:rotate-180" />} className="w-full sm:w-auto">
            {t.cta.button}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
