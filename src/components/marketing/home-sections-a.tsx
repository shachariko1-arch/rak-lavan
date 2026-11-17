"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, Gem, Heart, Inbox, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { InvitationThumbnail } from "@/components/invitation/thumbnail";
import { CountUp, Parallax, Reveal, useScrollDraw } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";
import { DEMO_FACTS } from "@/lib/invitation/facts";
import { designFromTemplate, TEMPLATES, type TemplateDefinition } from "@/lib/invitation/templates";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "./section";
import { useMarketing } from "./use-marketing";

export function ValueStrip() {
  const t = useMarketing();
  const { locale } = useLocale();
  const icons = [Heart, Sparkles, Gem, Inbox];
  const items = [...t.value.items, ...t.value.items];
  return (
    <section className="relative border-y border-white/[.06] bg-night-2 py-20 sm:py-24">
      <Container>
        <SectionHeading title={t.value.title} align="center" />
      </Container>
      <div className="mask-fade-x mt-14 overflow-hidden" dir="ltr">
        <div className={cn("flex w-max gap-4 hover:[animation-play-state:paused]", locale === "he" ? "animate-marquee-rtl" : "animate-marquee")}>
          {items.map((it, i) => {
            const Icon = icons[i % 4];
            return (
              <div key={i} dir={locale === "he" ? "rtl" : "ltr"} className="w-[300px] shrink-0 rounded-[18px] border border-white/[.08] bg-surface/70 p-7 sm:w-[340px]">
                <Icon className="h-5 w-5 text-champagne" strokeWidth={1.4} aria-hidden />
                <h3 className="mt-6 font-display text-[26px] leading-tight text-pearl">{it.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{it.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ withHeading = true }: { withHeading?: boolean }) {
  const t = useMarketing();
  const { ref, pathLength } = useScrollDraw<HTMLDivElement>();
  const visuals = [<FormVisual key="f" />, <AIVisual key="a" />, <ShareVisual key="s" />];
  return (
    <section className="relative py-24 sm:py-32" id="how">
      <Container>
        {withHeading && <SectionHeading eyebrow={t.how.eyebrow} title={t.how.title} />}
        <div ref={ref} className="relative mt-16 sm:mt-24">
          <svg className="pointer-events-none absolute start-[27px] top-0 hidden h-full w-[2px] lg:block" preserveAspectRatio="none" viewBox="0 0 2 100" aria-hidden>
            <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
            <motion.line x1="1" y1="0" x2="1" y2="100" stroke="#d9b98b" strokeWidth="2" style={{ pathLength }} />
          </svg>
          <ol className="space-y-24 sm:space-y-32">
            {t.how.steps.map((s, i) => (
              <li key={i} className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:ps-24">
                <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
                  <div className="flex items-baseline gap-4">
                    <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-champagne/40 bg-night font-display text-[22px] text-champagne lg:absolute lg:start-0">
                      <CountUp value={i + 1} format={(n) => String(Math.round(n)).padStart(2, "0")} />
                    </span>
                    <h3 className="font-display text-[clamp(1.9rem,1.4rem+1.6vw,2.9rem)] leading-[1.08] text-pearl">{s.title}</h3>
                  </div>
                  <p className="mt-5 max-w-md text-[16px] leading-relaxed text-mist">{s.text}</p>
                </Reveal>
                <Parallax offset={30} className={cn(i % 2 === 1 && "lg:order-1")}>
                  <Reveal y={50}>{visuals[i]}</Reveal>
                </Parallax>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("glass rounded-[24px] p-6 shadow-[var(--shadow-float)] sm:p-8", className)}>{children}</div>;
}

function FormVisual() {
  const t = useMarketing();
  const v = t.how.steps[0].visual as { title: string; fields: { label: string; value: string }[]; cta: string };
  return (
    <Panel>
      <p className="eyebrow text-champagne">{v.title}</p>
      <div className="mt-6 space-y-3">
        {v.fields.map((f, i) => (
          <motion.div key={f.label} className="rounded-[12px] border border-white/10 bg-night/50 px-4 py-3" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12 }}>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-smoke">{f.label}</span>
            <span className="mt-1 block text-[15px] text-pearl">{f.value}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <span className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 text-[13px] font-medium text-night">
          {v.cta} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </span>
      </div>
    </Panel>
  );
}

function AIVisual() {
  const t = useMarketing();
  const { locale } = useLocale();
  const v = t.how.steps[1].visual as { title: string; concepts: string[]; status: string };
  const slugs = ["midnight-elegance", "royal-champagne", "botanical-romance"];
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2 text-champagne">
          <Wand2 className="h-4 w-4" /> {v.title}
        </p>
        <span className="flex items-center gap-1.5 text-[12px] text-mist">
          <Check className="h-3.5 w-3.5 text-champagne" /> {v.status}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {slugs.map((slug, i) => {
          const tpl = TEMPLATES.find((x) => x.slug === slug)!;
          return (
            <motion.div key={slug} initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.25, duration: 0.9 }}>
              <div className={cn("overflow-hidden rounded-[14px] ring-1", i === 0 ? "ring-champagne" : "ring-white/10")}>
                <InvitationThumbnail design={designFromTemplate(tpl, locale)} facts={DEMO_FACTS[locale]} />
              </div>
              <p className="mt-2 truncate text-center text-[11.5px] text-mist">{v.concepts[i]}</p>
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}

function ShareVisual() {
  const t = useMarketing();
  const v = t.how.steps[2].visual as { message: string; confirmed: string; dashboard: string };
  return (
    <Panel className="space-y-4">
      <div className="max-w-[85%] rounded-[16px] rounded-ss-[4px] bg-[#1f3a30] px-4 py-3 text-[14px] text-pearl">{v.message}</div>
      <motion.div className="ms-auto flex max-w-[85%] items-center gap-3 rounded-[16px] border border-confirmed/40 bg-confirmed/10 px-4 py-3 text-[14px] text-pearl" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-confirmed text-white"><Check className="h-4 w-4" /></span>
        {v.confirmed}
      </motion.div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { l: v.dashboard, n: 219, c: "text-[#5fc49a]" },
          { l: "RSVP", n: 74, c: "text-champagne", s: "%" },
          { l: "Total", n: 350, c: "text-pearl" },
        ].map((k) => (
          <div key={k.l} className="rounded-[12px] border border-white/10 bg-night/50 p-3">
            <span className="block text-[10.5px] uppercase tracking-[0.16em] text-smoke">{k.l}</span>
            <span className={cn("font-display text-[28px]", k.c)}>
              <CountUp value={k.n} />
              {k.s}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function TemplateCard({ template, priority }: { template: TemplateDefinition; priority?: boolean }) {
  const t = useMarketing();
  const { locale } = useLocale();
  const design = designFromTemplate(template, locale);
  void priority;
  return (
    <TiltCard className="group">
      <article className="relative overflow-hidden rounded-[24px] border border-white/[.08] bg-surface transition-[border-color,box-shadow] duration-500 group-hover:border-champagne/45 group-hover:shadow-[0_40px_80px_-40px_rgba(217,185,139,.35)]">
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]">
            <InvitationThumbnail design={design} facts={DEMO_FACTS[locale]} height={600} />
          </div>
          {template.premium && <span className="absolute end-4 top-4 rounded-full bg-night/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-champagne backdrop-blur">{t.templates.premium}</span>}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-2 bg-gradient-to-t from-night via-night/85 to-transparent p-5 pt-16 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
            <p className="text-[12.5px] text-mist">{t.templates.details}</p>
            <div className="flex gap-2">
              <ButtonLink href={`/templates/${template.slug}`} size="sm" variant="outline" icon={<Eye className="h-3.5 w-3.5" />}>
                {t.templates.preview}
              </ButtonLink>
              <ButtonLink href={`/register?template=${template.slug}`} size="sm">
                {t.templates.use}
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <h3 className="font-display text-[24px] leading-tight text-pearl">
              <Link href={`/templates/${template.slug}`} className="after:absolute after:inset-0 lg:after:hidden">{template.name[locale]}</Link>
            </h3>
            <p className="mt-1 text-[13px] text-smoke">{template.tagline[locale]}</p>
          </div>
          <div className="flex -space-x-1.5 pt-1 rtl:space-x-reverse">
            {template.palette.map((c) => (
              <span key={c} className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: c }} />
            ))}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export function TemplateGallery() {
  const t = useMarketing();
  return (
    <section className="relative bg-night-2 py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={t.templates.eyebrow} title={t.templates.title} description={t.templates.description} />
          <ButtonLink href="/templates" variant="outline" iconEnd={<ArrowRight className="h-4 w-4 rtl:rotate-180" />} className="self-start lg:self-auto">
            {t.templates.viewAll}
          </ButtonLink>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.slice(0, 6).map((tpl, i) => (
            <Reveal key={tpl.slug} delay={(i % 3) * 0.1}>
              <TemplateCard template={tpl} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

