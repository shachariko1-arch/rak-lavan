import { useId } from "react";
import { cn } from "@/lib/utils";
import { LOCKUP, SYMBOL, WORDMARK } from "./logo-data";

type Tone = "champagne" | "white" | "black" | "current";

function ringColors(tone: Tone, gradientId: string) {
  if (tone === "champagne") return `url(#${gradientId})`;
  if (tone === "white") return "#FFFFFF";
  if (tone === "black") return "#08090D";
  return "currentColor";
}
function wordColor(tone: Tone) {
  if (tone === "champagne") return "#F4EFE6";
  if (tone === "white") return "#FFFFFF";
  if (tone === "black") return "#08090D";
  return "currentColor";
}

function Rings({ id, stroke }: { id: string; stroke: string }) {
  const s = SYMBOL;
  return (
    <>
      <defs>
        <mask id={`${id}-a`} maskUnits="userSpaceOnUse" x="0" y="0" width={s.width} height={s.height}>
          <rect width={s.width} height={s.height} fill="#fff" />
          <circle cx={s.p2.x} cy={s.p2.y} r={s.gap} fill="#000" />
        </mask>
        <mask id={`${id}-b`} maskUnits="userSpaceOnUse" x="0" y="0" width={s.width} height={s.height}>
          <rect width={s.width} height={s.height} fill="#fff" />
          <circle cx={s.p1.x} cy={s.p1.y} r={s.gap} fill="#000" />
        </mask>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EBD4AF" />
          <stop offset="0.55" stopColor="#D9B98B" />
          <stop offset="1" stopColor="#B99A70" />
        </linearGradient>
      </defs>
      <circle cx={s.c1.x} cy={s.c1.y} r={s.r} fill="none" stroke={stroke} strokeWidth={s.stroke} mask={`url(#${id}-a)`} />
      <circle cx={s.c2.x} cy={s.c2.y} r={s.r} fill="none" stroke={stroke} strokeWidth={s.stroke} mask={`url(#${id}-b)`} />
    </>
  );
}

/** The VOW lockup: interlocking rings + serif wordmark. Never distorted (fixed viewBox). */
export function Logo({ tone = "champagne", className, title = "VOW" }: { tone?: Tone; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const w = SYMBOL.width + LOCKUP.gapX + WORDMARK.width * LOCKUP.wordScale;
  const h = SYMBOL.height;
  const wordY = (h - WORDMARK.height * LOCKUP.wordScale) / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-7 w-auto", className)} role="img" aria-label={title}>
      <Rings id={id} stroke={ringColors(tone, `${id}-g`)} />
      <path
        transform={`translate(${SYMBOL.width + LOCKUP.gapX} ${wordY}) scale(${LOCKUP.wordScale})`}
        fill={wordColor(tone)}
        d={WORDMARK.path}
      />
    </svg>
  );
}

export function LogoSymbol({ tone = "champagne", className, title = "VOW" }: { tone?: Tone; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${SYMBOL.width} ${SYMBOL.height}`} className={cn("h-8 w-auto", className)} role="img" aria-label={title}>
      <Rings id={id} stroke={ringColors(tone, `${id}-g`)} />
    </svg>
  );
}

export function Wordmark({ className, tone = "current" }: { className?: string; tone?: Tone }) {
  return (
    <svg viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`} className={cn("h-5 w-auto", className)} role="img" aria-label="VOW">
      <path fill={wordColor(tone)} d={WORDMARK.path} />
    </svg>
  );
}
