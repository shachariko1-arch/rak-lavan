"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { InvitationDesign, OpeningId } from "@/lib/invitation/schema";
import { BotanicalSpray } from "@/components/art/ornaments";
import { InvitationBackdrop } from "./cover";
import { inviteCopy } from "./copy";

type OpeningProps = {
  kind: OpeningId;
  design: InvitationDesign;
  initials: string;
  locale: Locale;
  /** Called once the opening sequence has finished. */
  onOpened: () => void;
  /** Fired at the moment of user interaction (used to start music). */
  onInteract?: () => void;
  /** Start opening without a tap (used by marketing "Play"). */
  autoPlay?: boolean;
  /** Positioning: fixed full-screen for live invitations, absolute inside previews. */
  contained?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** The opening overlay. Always requires a deliberate tap (unless autoPlay). */
export function OpeningOverlay(props: OpeningProps) {
  if (props.kind === "envelope") return <EnvelopeAnimation {...props} />;
  return <SimpleOpening {...props} />;
}

function Prompt({ locale, onClick, light, focus = true }: { locale: Locale; onClick: () => void; light?: boolean; focus?: boolean }) {
  const t = inviteCopy[locale];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="inv-eyebrow mt-10 rounded-full border px-6 py-3 backdrop-blur-sm transition hover:bg-white/10"
      style={{ borderColor: light ? "rgba(255,255,255,.35)" : "color-mix(in srgb, var(--inv-text) 30%, transparent)", color: light ? "#fff" : "var(--inv-text)" }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
      autoFocus={focus}
    >
      {t.openInvitation}
    </motion.button>
  );
}

function useOpening(onOpened: () => void, onInteract: (() => void) | undefined, durationMs: number, autoPlay?: boolean) {
  const [phase, setPhase] = useState<"closed" | "opening">("closed");
  const reduce = useReducedMotion();
  const open = () => {
    if (phase !== "closed") return;
    onInteract?.();
    setPhase("opening");
    window.setTimeout(onOpened, reduce ? 250 : durationMs);
  };
  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setTimeout(() => {
      setPhase("opening");
      window.setTimeout(onOpened, reduce ? 250 : durationMs);
    }, 700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);
  return { phase, open, reduce };
}

export function EnvelopeAnimation({ design, initials, locale, onOpened, onInteract, autoPlay, contained }: OpeningProps) {
  const { phase, open, reduce } = useOpening(onOpened, onInteract, 2600, autoPlay);
  const opening = phase === "opening";
  const paper = design.colors.surface;
  const accent = design.colors.accent;

  return (
    <motion.div
      className={`${contained ? "absolute" : "fixed"} inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduce ? 1 : 1.06, transition: { duration: reduce ? 0.2 : 0.9, ease: EASE } }}
      onClick={open}
    >
      <InvitationBackdrop design={design} priority />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex w-full flex-col items-center px-6" style={{ perspective: 1400 }}>
        <motion.div
          className="relative aspect-[1.42] w-[min(86vw,460px)]"
          style={{ maxWidth: contained ? "86%" : undefined }}
          initial={{ y: 30, opacity: 0, rotateX: 8 }}
          animate={opening ? { y: reduce ? 0 : 70, opacity: 1, rotateX: 0 } : { y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: opening ? 1 : 1.2, delay: opening ? 1.1 : 0, ease: EASE }}
        >
          {/* Envelope back */}
          <div className="absolute inset-0 rounded-[6px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.55)]" style={{ background: shade(paper, -0.08) }} />

          {/* Card that slides up */}
          <motion.div
            className="absolute inset-x-[6%] top-[6%] bottom-[8%] flex flex-col items-center justify-center rounded-[4px] text-center"
            style={{ background: paper, color: design.colors.text, zIndex: opening ? 3 : 1 }}
            initial={{ y: 0 }}
            animate={opening && !reduce ? { y: "-58%" } : { y: 0 }}
            transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
          >
            <span className="inv-eyebrow" style={{ color: accent }}>
              {design.content.eyebrow}
            </span>
            <span className="mt-2 text-[clamp(22px,6vw,34px)]" style={{ fontFamily: "var(--inv-display)", fontStyle: "var(--inv-name-style)" as never }}>
              {initials.split("").join(" & ")}
            </span>
          </motion.div>

          {/* Front pocket (bottom + sides) */}
          <div
            className="absolute inset-0 rounded-[6px]"
            style={{
              zIndex: 2,
              background: `linear-gradient(160deg, ${paper}, ${shade(paper, -0.04)})`,
              clipPath: "polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ zIndex: 2, clipPath: "polygon(0 100%, 50% 50%, 100% 100%)", background: shade(paper, -0.03) }}
          />

          {/* Top flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[58%] origin-top"
            style={{
              zIndex: opening ? 0 : 4,
              background: `linear-gradient(180deg, ${shade(paper, 0.02)}, ${shade(paper, -0.06)})`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible",
            }}
            initial={{ rotateX: 0 }}
            animate={opening ? { rotateX: reduce ? 0 : 178 } : { rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          />

          {/* Wax seal */}
          <motion.div
            className="absolute left-1/2 top-[50%] grid h-[clamp(52px,15vw,74px)] w-[clamp(52px,15vw,74px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_6px_14px_rgba(0,0,0,.35)]"
            style={{
              zIndex: 5,
              background: `radial-gradient(circle at 35% 30%, ${shade(accent, 0.25)}, ${accent} 55%, ${shade(accent, -0.25)})`,
              color: shade(accent, -0.55),
            }}
            animate={opening ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <span className="text-[clamp(16px,4.5vw,22px)]" style={{ fontFamily: "var(--inv-display)" }}>
              {initials}
            </span>
          </motion.div>
        </motion.div>

        {!opening && !autoPlay && <Prompt locale={locale} onClick={open} light={isDark(design.colors.background)} focus={!contained} />}
      </div>
    </motion.div>
  );
}

function SimpleOpening({ kind, design, initials, locale, onOpened, onInteract, autoPlay, contained }: OpeningProps) {
  const duration = kind === "fade" ? 900 : kind === "cinematic" ? 2200 : 1700;
  const { phase, open, reduce } = useOpening(onOpened, onInteract, duration, autoPlay);
  const opening = phase === "opening";
  const dark = isDark(design.colors.background);
  const position = contained ? "absolute" : "fixed";

  const center = (
    <motion.div
      className="relative z-10 flex flex-col items-center text-center"
      animate={opening ? { opacity: 0, y: reduce ? 0 : -16, filter: "blur(4px)" } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.span
        className="grid h-24 w-24 place-items-center rounded-full border text-[30px]"
        style={{ borderColor: "color-mix(in srgb, var(--inv-accent) 70%, transparent)", color: "var(--inv-accent)", fontFamily: "var(--inv-display)" }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {initials}
      </motion.span>
      {!autoPlay && <Prompt locale={locale} onClick={open} light={dark} focus={!contained} />}
    </motion.div>
  );

  if (kind === "slide") {
    return (
      <motion.div className={`${position} inset-0 z-[60] flex items-center justify-center`} onClick={open} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
        {[0, 1].map((side) => (
          <motion.div
            key={side}
            className="absolute inset-y-0 w-1/2 overflow-hidden"
            style={{ [side === 0 ? "left" : "right"]: 0 } as React.CSSProperties}
            animate={opening ? { x: reduce ? 0 : side === 0 ? "-100%" : "100%", opacity: reduce ? 0 : 1 } : { x: 0 }}
            transition={{ duration: 1.4, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="absolute inset-y-0 w-[200%]" style={{ [side === 0 ? "left" : "right"]: 0 } as React.CSSProperties}>
              <InvitationBackdrop design={design} priority />
            </div>
            <div className="absolute inset-y-0 w-px" style={{ [side === 0 ? "right" : "left"]: 0, background: "var(--inv-accent)", opacity: 0.6 } as React.CSSProperties} />
          </motion.div>
        ))}
        {center}
      </motion.div>
    );
  }

  if (kind === "paper") {
    return (
      <motion.div className={`${position} inset-0 z-[60] flex items-center justify-center`} onClick={open} style={{ perspective: 1600 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
        <InvitationBackdrop design={design} priority />
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 origin-bottom"
          style={{ background: design.colors.surface, boxShadow: "0 1px 0 rgba(0,0,0,.08)" }}
          animate={opening ? { rotateX: reduce ? 0 : 92, opacity: reduce ? 0 : [1, 1, 0] } : { rotateX: 0 }}
          transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 origin-top"
          style={{ background: shade(design.colors.surface, -0.04) }}
          animate={opening ? { rotateX: reduce ? 0 : -92, opacity: reduce ? 0 : [1, 1, 0] } : { rotateX: 0 }}
          transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
        />
        <div className="relative" style={{ color: design.colors.text }}>
          {center}
        </div>
      </motion.div>
    );
  }

  if (kind === "cinematic") {
    return (
      <motion.div
        className={`${position} inset-0 z-[60] flex items-center justify-center bg-black`}
        onClick={open}
        exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 1.2, ease: EASE } }}
      >
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-[45%]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(235,212,175,.28), transparent)" }}
          initial={{ x: "-120%" }}
          animate={opening && !reduce ? { x: "260%" } : { x: "-120%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        <motion.div className="absolute inset-x-0 top-0 h-[12%] bg-black" animate={opening ? { scaleY: 0 } : { scaleY: 1 }} style={{ originY: 0 }} transition={{ duration: 1.2, delay: 0.6 }} />
        <motion.div className="absolute inset-x-0 bottom-0 h-[12%] bg-black" animate={opening ? { scaleY: 0 } : { scaleY: 1 }} style={{ originY: 1 }} transition={{ duration: 1.2, delay: 0.6 }} />
        <div className="text-white">{center}</div>
      </motion.div>
    );
  }

  if (kind === "botanical") {
    return (
      <motion.div className={`${position} inset-0 z-[60] flex items-center justify-center overflow-hidden`} onClick={open} exit={{ opacity: 0, transition: { duration: 0.8 } }}>
        <InvitationBackdrop design={design} priority />
        <motion.div
          className="absolute -left-10 -top-10 w-[70%] max-w-[420px] rotate-180"
          animate={opening ? { x: reduce ? 0 : -160, y: reduce ? 0 : -120, rotate: 170, opacity: 0 } : { x: 0, y: 0 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <BotanicalSpray color={design.colors.accent} className="w-full" flip />
        </motion.div>
        <motion.div
          className="absolute -bottom-10 -right-10 w-[75%] max-w-[460px]"
          animate={opening ? { x: reduce ? 0 : 160, y: reduce ? 0 : 120, rotate: 10, opacity: 0 } : { x: 0, y: 0 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <BotanicalSpray color={design.colors.accent} className="w-full" flip />
        </motion.div>
        <div style={{ color: design.colors.text }}>{center}</div>
      </motion.div>
    );
  }

  // fade
  return (
    <motion.div className={`${position} inset-0 z-[60] flex items-center justify-center`} onClick={open} exit={{ opacity: 0, transition: { duration: 0.8, ease: EASE } }}>
      <InvitationBackdrop design={design} priority />
      <div style={{ color: design.colors.text }}>{center}</div>
    </motion.div>
  );
}

/** Lighten (+) or darken (−) a hex colour. */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount)),
  );
  return `#${ch.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

export function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}
