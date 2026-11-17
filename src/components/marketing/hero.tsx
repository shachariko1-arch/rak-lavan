"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Activity, MessageCircle, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import { SilkHero } from "@/components/art/silk-hero";
import { WeddingCountdown } from "@/components/invitation/countdown";
import { InvitationCover } from "@/components/invitation/cover";
import { ScaledFrame } from "@/components/invitation/thumbnail";
import { themeVars } from "@/components/invitation/theme";
import { RevealLines } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";
import { DEMO_FACTS, eventStart } from "@/lib/invitation/facts";
import { designFromTemplate, getTemplate } from "@/lib/invitation/templates";
import { PaperCard, SmartphoneMockup } from "./devices";
import { Container } from "./section";
import { useMarketing } from "./use-marketing";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const t = useMarketing();
  const { locale } = useLocale();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-28 sm:pt-32"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <motion.div className="absolute inset-0 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}>
        <SilkHero className="absolute inset-0" />
      </motion.div>

      <Container className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="relative z-10 max-w-[640px]">
          <motion.p
            className="eyebrow mb-7 flex items-center gap-3 text-champagne"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            <span className="h-px w-10 bg-champagne/60" aria-hidden />
            {t.hero.eyebrow}
          </motion.p>
          <RevealLines
            as="h1"
            immediate
            delay={0.65}
            lines={t.hero.title.map((l, i) => (i === t.hero.title.length - 1 ? <span key={i} className="text-champagne-gradient italic">{l}</span> : l))}
            className="font-display text-hero text-pearl"
          />
          <motion.p
            className="mt-7 max-w-[520px] text-[16px] leading-relaxed text-mist sm:text-[18px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
          >
            {t.hero.description}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3, ease: EASE }}
          >
            <ButtonLink href="/register" size="lg" iconEnd={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}>
              {t.hero.primary}
            </ButtonLink>
            <ButtonLink href="/templates" size="lg" variant="outline">
              {t.hero.secondary}
            </ButtonLink>
          </motion.div>
        </div>

        <InvitationShowcase locale={locale} sx={sx} sy={sy} />
      </Container>

      <FeatureHighlights />
    </section>
  );
}

function InvitationShowcase({ locale, sx, sy }: { locale: "en" | "he"; sx: ReturnType<typeof useSpring>; sy: ReturnType<typeof useSpring> }) {
  const t = useMarketing();
  const reduce = useReducedMotion();
  const facts = DEMO_FACTS[locale];
  const designs = useMemo(() => {
    const midnight = designFromTemplate(getTemplate("midnight-elegance")!, locale);
    midnight.content.headline = `${t.hero.phone.invited} ${t.hero.phone.wedding}`;
    const marble = designFromTemplate(getTemplate("botanical-romance")!, locale);
    marble.background.texture = "marble";
    const sunset = designFromTemplate(getTemplate("mediterranean-sunset")!, locale);
    return { midnight, marble, sunset };
  }, [locale, t]);

  const rotY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const backX = useTransform(sx, [-0.5, 0.5], [22, -22]);
  const backY = useTransform(sy, [-0.5, 0.5], [16, -16]);
  const frontX = useTransform(sx, [-0.5, 0.5], [-14, 14]);

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[560px] sm:h-[640px] lg:h-[680px]" style={{ perspective: 1600 }}>
      {/* Ivory marble card — enters from start side */}
      <motion.div className="absolute start-[0%] top-[12%] w-[44%] sm:w-[40%]" style={{ x: backX, y: backY }}>
        <motion.div
          initial={{ opacity: 0, x: locale === "he" ? 120 : -120, rotate: -14 }}
          animate={{ opacity: 1, x: 0, rotate: -9 }}
          transition={{ duration: 1.4, delay: 1.2, ease: EASE }}
        >
          <motion.div animate={reduce ? undefined : { y: [0, -12, 0], rotate: [0, 1.2, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}>
            <PaperCard>
              <Cover design={designs.marble} facts={facts} />
            </PaperCard>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Sunset card — enters from end side */}
      <motion.div className="absolute end-[0%] top-[30%] w-[44%] sm:w-[40%]" style={{ x: backX, y: backY }}>
        <motion.div
          initial={{ opacity: 0, x: locale === "he" ? -120 : 120, rotate: 14 }}
          animate={{ opacity: 1, x: 0, rotate: 8 }}
          transition={{ duration: 1.4, delay: 1.35, ease: EASE }}
        >
          <motion.div animate={reduce ? undefined : { y: [0, 10, 0], rotate: [0, -1.4, 0] }} transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}>
            <PaperCard>
              <Cover design={designs.sunset} facts={facts} />
            </PaperCard>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The phone — focal point */}
      <motion.div
        className="absolute left-1/2 top-[2%] w-[52%] max-w-[290px] -translate-x-1/2"
        style={{ x: frontX, rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.86, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.5, delay: 1.45, ease: EASE }}>
          <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(217,185,139,.28),transparent)] blur-2xl" aria-hidden />
            <SmartphoneMockup>
              <PhoneScreen design={designs.midnight} facts={facts} locale={locale} />
            </SmartphoneMockup>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Cover({ design, facts }: { design: ReturnType<typeof designFromTemplate>; facts: (typeof DEMO_FACTS)["en"] }) {
  return (
    <ScaledFrame width={390} height={560}>
      <div className="inv-root h-full" style={themeVars(design)} dir={design.language === "he" ? "rtl" : "ltr"} lang={design.language}>
        <InvitationCover design={design} facts={facts} className="h-full" compact />
      </div>
    </ScaledFrame>
  );
}

function PhoneScreen({ design, facts, locale }: { design: ReturnType<typeof designFromTemplate>; facts: (typeof DEMO_FACTS)["en"]; locale: "en" | "he" }) {
  const t = useMarketing();
  return (
    <ScaledFrame width={390} height={844} className="h-full">
      <div className="inv-root relative flex h-full flex-col" style={themeVars(design)} dir={locale === "he" ? "rtl" : "ltr"} lang={locale}>
        <InvitationCover design={design} facts={facts} className="flex-1" compact />
        <div className="relative z-10 px-8 pb-14" style={{ background: design.colors.background }}>
          <WeddingCountdown target={eventStart(facts)} locale={locale} showSeconds={false} />
          <span className="inv-button mt-7 block text-center">{t.hero.phone.confirm}</span>
        </div>
      </div>
    </ScaledFrame>
  );
}

function FeatureHighlights() {
  const t = useMarketing();
  const icons = [Sparkles, Users, Activity, MessageCircle];
  return (
    <Container className="relative z-10 mt-6 pb-10 sm:mt-10">
      <motion.ul
        className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-white/[.08] bg-white/[.06] lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.9, ease: EASE }}
      >
        {t.hero.highlights.map((h, i) => {
          const Icon = icons[i];
          return (
            <li key={h.title} className="flex flex-col gap-3 bg-night/80 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-champagne/30 text-champagne">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.4} aria-hidden />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-pearl">{h.title}</span>
                <span className="block text-[12.5px] text-smoke">{h.text}</span>
              </span>
            </li>
          );
        })}
      </motion.ul>
    </Container>
  );
}
