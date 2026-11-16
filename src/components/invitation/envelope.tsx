"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { resolvePalette } from "@/lib/templates";
import type { Palette } from "@/lib/types";
import { contrastRatio, mixHex } from "@/lib/utils";

/** Card width shared by the envelope and the page hero, so the hand-off is seamless. */
export const CARD_WIDTH = "min(86vw, calc(76svh * 5 / 7), 440px)";

const EASE = [0.22, 1, 0.36, 1] as const;

interface EnvelopeProps {
  palette: Palette;
  initials: [string, string];
  /** "For Yael" line above the envelope. */
  greeting: string;
  hint: string;
  skipLabel: string;
  card: ReactNode;
  onDone: () => void;
}

/**
 * Full-screen opening sequence: the wax seal lifts, the flap opens, the card rises out
 * of the envelope and grows into place exactly where the page hero shows it.
 */
export function Envelope({ palette, initials, greeting, hint, skipLabel, card, onDone }: EnvelopeProps) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const p = resolvePalette(palette);
  const paper = p.dark ? mixHex(p.bg, "#ffffff", 0.1) : mixHex(p.bg, p.ink, 0.07);
  const paperShade = p.dark ? mixHex(p.bg, "#ffffff", 0.04) : mixHex(p.bg, p.ink, 0.14);
  const sealInk = contrastRatio(p.accent, "#ffffff") > 2.6 ? "#ffffff" : p.ink;

  useEffect(() => {
    if (stage === 1) {
      const t = window.setTimeout(() => setStage(2), 2300);
      return () => window.clearTimeout(t);
    }
    if (stage === 2) {
      const t = window.setTimeout(onDone, 1250);
      return () => window.clearTimeout(t);
    }
  }, [stage, onDone]);

  const box = { width: "var(--w)", height: "calc(var(--w) * 0.68)", x: "-50%", marginTop: "calc(var(--w) * -0.22)" } as const;
  const fall = stage === 2 ? { opacity: 0, y: "70vh" } : { opacity: 1, y: 0 };

  const open = () => {
    if (stage !== 0) return;
    if (reduce) onDone();
    else setStage(1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-hidden"
      style={{ background: `radial-gradient(120% 90% at 50% 20%, ${p.bg}, ${p.soft})`, ["--w" as string]: CARD_WIDTH }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-x-0 top-[9svh] px-6 text-center"
        animate={{ opacity: stage === 0 ? 1 : 0, y: stage === 0 ? 0 : -12 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-serif text-[26px] italic leading-tight he:not-italic" style={{ color: p.ink }}>
          {greeting}
        </p>
      </motion.div>

      {/* Back of the envelope: inner liner and the flap */}
      <motion.div className="absolute left-1/2 top-1/2" style={{ ...box, zIndex: 1, perspective: 1400 }} initial={{ opacity: 0, y: 30 }} animate={fall} transition={{ duration: 0.9, ease: EASE }}>
        <div className="absolute inset-0 rounded-md shadow-lift" style={{ background: paperShade }}>
          <div className="absolute inset-x-0 top-0 h-[58%] opacity-90" style={{ background: p.accent, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        </div>
        <motion.div
          className="absolute inset-x-0 top-0 h-[60%] origin-top"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: `linear-gradient(to bottom, ${paper}, ${paperShade})` }}
          animate={{ rotateX: stage === 0 ? 0 : 180 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        />
      </motion.div>

      {/* Front pocket and wax seal, above the card */}
      <motion.div className="absolute left-1/2 top-1/2" style={{ ...box, zIndex: 3 }} initial={{ opacity: 0, y: 30 }} animate={fall} transition={{ duration: 0.9, ease: EASE }}>
        <div
          className="absolute inset-0 rounded-md"
          style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)", background: `linear-gradient(to top, ${paper} 30%, ${paperShade} 130%)` }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, transparent 49.6%, ${p.line} 50%, transparent 50.4%)`, opacity: 0.5 }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(-115deg, transparent 49.6%, ${p.line} 50%, transparent 50.4%)`, opacity: 0.5 }} />
        </div>
        <motion.button
          type="button"
          onClick={open}
          aria-label={hint}
          className="absolute left-1/2 top-[55%] flex items-center justify-center rounded-full font-serif shadow-lift"
          style={{
            width: "calc(var(--w) * 0.2)",
            height: "calc(var(--w) * 0.2)",
            x: "-50%",
            y: "-50%",
            fontSize: "calc(var(--w) * 0.062)",
            color: sealInk,
            background: `radial-gradient(circle at 35% 30%, ${mixHex(p.accent, "#ffffff", 0.3)}, ${p.accent} 55%, ${mixHex(p.accent, "#000000", 0.3)})`,
          }}
          animate={stage === 0 ? { scale: [1, 1.05, 1], opacity: 1 } : { scale: 0.3, opacity: 0, rotate: 30 }}
          transition={stage === 0 ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.45 }}
        >
          <span dir="ltr" className="flex items-center gap-[0.2em]">
            {initials[0]}
            <span className="text-[0.6em] opacity-80">&amp;</span>
            {initials[1]}
          </span>
        </motion.button>
      </motion.div>

      {/* Card: clipped at the envelope's bottom edge until it has risen clear */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: stage === 2 ? 6 : 2,
          clipPath: stage === 2 ? undefined : "inset(-50% -50% calc(50% - var(--w) * 0.46) -50%)",
        }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: "var(--w)", x: "-50%", marginTop: "calc(var(--w) * -0.7)" }}
          initial={{ y: "30.1%", scale: 0.86, opacity: 0 }}
          animate={
            stage === 0
              ? { y: "30.1%", scale: 0.86, opacity: 0 }
              : stage === 1
                ? { y: "-20%", scale: 0.86, opacity: 1 }
                : { y: "0%", scale: 1, opacity: 1 }
          }
          transition={
            stage === 1
              ? { duration: 1.3, delay: 0.85, ease: EASE, opacity: { duration: 0.2, delay: 0.8 } }
              : { duration: 1.1, ease: EASE }
          }
        >
          {card}
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-[7svh] flex flex-col items-center gap-3 px-6"
        animate={{ opacity: stage === 0 ? 1 : 0 }}
      >
        <button type="button" onClick={open} className="eyebrow animate-pulse" style={{ color: p.accentText }}>
          {hint}
        </button>
        <button type="button" onClick={onDone} className="text-xs underline-offset-4 hover:underline" style={{ color: p.muted }}>
          {skipLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}
