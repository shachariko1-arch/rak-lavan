"use client";

import { motion } from "framer-motion";
import { createContext, useContext, useId } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

/** True while a card should play its entrance animation. */
export const CardMotion = createContext(false);

const EASE = [0.22, 1, 0.36, 1] as const;

/** A block of card content. Fades up in sequence when the card is animated. */
export function Rise({
  i = 0,
  className,
  style,
  children,
}: {
  i?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const animated = useContext(CardMotion);
  if (!animated) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, delay: 0.3 + i * 0.11, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** An SVG path that draws itself when the card is animated. */
export function Draw({
  delay = 0,
  duration = 1.8,
  ...props
}: SVGProps<SVGPathElement> & { delay?: number; duration?: number }) {
  const animated = useContext(CardMotion);
  if (!animated) return <path {...props} />;
  return (
    <motion.path
      {...(props as object)}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration, delay, ease: EASE }, opacity: { duration: 0.3, delay } }}
    />
  );
}

/** Scales a shape in from nothing (leaves, blossoms, stars). */
function Pop({ delay = 0, children, origin }: { delay?: number; children: ReactNode; origin: string }) {
  const animated = useContext(CardMotion);
  if (!animated) return <g>{children}</g>;
  return (
    <motion.g
      style={{ transformOrigin: origin, transformBox: "fill-box" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.g>
  );
}

/* ───────────────────────── Classic ───────────────────────── */

/** Double hairline frame with concave corners, as on engraved stationery. */
export function ClassicFrame() {
  const frame = (inset: number, r: number) => {
    const a = inset;
    const b = 500 - inset;
    const c = 700 - inset;
    return `M${a + r},${a} H${b - r} A${r} ${r} 0 0 0 ${b} ${a + r} V${c - r} A${r} ${r} 0 0 0 ${b - r} ${c} H${a + r} A${r} ${r} 0 0 0 ${a} ${c - r} V${a + r} A${r} ${r} 0 0 0 ${a + r} ${a} Z`;
  };
  return (
    <svg viewBox="0 0 500 700" className="pointer-events-none absolute inset-0 size-full" fill="none" aria-hidden>
      <Draw d={frame(20, 20)} stroke="var(--inv-accent)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" duration={2.4} />
      <Draw d={frame(29, 14)} stroke="var(--inv-accent)" strokeOpacity="0.55" strokeWidth="0.6" vectorEffect="non-scaling-stroke" delay={0.25} duration={2.4} />
    </svg>
  );
}

export function Monogram({ a, b, className }: { a: string; b: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full border border-[color:var(--inv-accent)]",
        className,
      )}
    >
      <span className="absolute inset-[7%] rounded-full border border-[color:var(--inv-accent)] opacity-40" />
      <span className="flex items-center gap-[0.32em] font-serif leading-none text-[color:var(--inv-accent-text)]">
        <span>{a}</span>
        <span className="h-[1.1em] w-px bg-[color:var(--inv-accent)] opacity-70" />
        <span>{b}</span>
      </span>
    </div>
  );
}

/** Hairline, diamond, hairline. */
export function DiamondRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-[2.4cqw]", className)} aria-hidden>
      <span className="h-px w-[12cqw] bg-[color:var(--inv-accent)] opacity-60" />
      <span className="size-[1.3cqw] rotate-45 bg-[color:var(--inv-accent)]" />
      <span className="h-px w-[12cqw] bg-[color:var(--inv-accent)] opacity-60" />
    </div>
  );
}

/* ───────────────────────── Garden ───────────────────────── */

interface SprigProps {
  className?: string;
  style?: CSSProperties;
  /** Mirrors the sprig horizontally. */
  flip?: boolean;
  delay?: number;
  blossoms?: boolean;
}

/**
 * A eucalyptus sprig: a curved stem with paired round leaves and a few blossoms.
 * The stem draws itself, then the leaves open one pair at a time.
 */
export function Sprig({ className, style, flip, delay = 0, blossoms = true }: SprigProps) {
  // Stem: cubic Bézier from the base (bottom-left) sweeping up and to the right.
  const p0 = [18, 232];
  const p1 = [70, 170];
  const p2 = [96, 96];
  const p3 = [196, 26];
  const point = (t: number) => {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  };
  const tangent = (t: number) => {
    const u = 1 - t;
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const leaves = [0.16, 0.3, 0.44, 0.58, 0.71, 0.83, 0.94].map((t, index) => {
    const [x, y] = point(t);
    const angle = tangent(t);
    const size = 17 - index * 1.25;
    return { x, y, angle, size, index };
  });
  const [tipX, tipY] = point(1);

  return (
    <svg
      viewBox="0 0 220 250"
      className={cn("pointer-events-none overflow-visible", className)}
      style={{ ...style, transform: `${style?.transform ?? ""}${flip ? " scaleX(-1)" : ""}` }}
      fill="none"
      aria-hidden
    >
      <g className="origin-[8%_92%] animate-sway" style={{ transformBox: "fill-box" }}>
        <Draw
          d={`M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`}
          stroke="var(--inv-accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          delay={delay}
          duration={1.6}
        />
        {leaves.map((leaf) => (
          <g key={leaf.index} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
            {[-1, 1].map((side) => (
              <Pop key={side} delay={delay + 0.35 + leaf.index * 0.14} origin={side < 0 ? "50% 100%" : "50% 0%"}>
                <ellipse
                  cx={0}
                  cy={side * (leaf.size * 0.62)}
                  rx={leaf.size * 0.5}
                  ry={leaf.size * 0.62}
                  transform={`rotate(${side * -18})`}
                  fill="var(--inv-accent)"
                  fillOpacity={0.3 + (leaf.index % 3) * 0.14}
                  stroke="var(--inv-accent)"
                  strokeWidth="0.9"
                  strokeOpacity="0.75"
                />
              </Pop>
            ))}
          </g>
        ))}
        <Pop delay={delay + 1.4} origin="50% 50%">
          <ellipse cx={tipX + 3} cy={tipY - 3} rx="5" ry="7" transform={`rotate(40 ${tipX} ${tipY})`} fill="var(--inv-accent)" fillOpacity="0.5" />
        </Pop>
        {blossoms
          ? [
              { x: 52, y: 196, r: 9, d: 1.1 },
              { x: 112, y: 112, r: 7, d: 1.35 },
              { x: 30, y: 172, r: 5.5, d: 1.55 },
            ].map((b) => (
              <Pop key={`${b.x}-${b.y}`} delay={delay + b.d} origin="50% 50%">
                {[0, 72, 144, 216, 288].map((rotation) => (
                  <ellipse
                    key={rotation}
                    cx={b.x}
                    cy={b.y - b.r * 0.72}
                    rx={b.r * 0.48}
                    ry={b.r * 0.72}
                    transform={`rotate(${rotation} ${b.x} ${b.y})`}
                    fill="var(--inv-accent2)"
                    fillOpacity="0.85"
                  />
                ))}
                <circle cx={b.x} cy={b.y} r={b.r * 0.24} fill="var(--inv-bg)" />
              </Pop>
            ))
          : null}
      </g>
    </svg>
  );
}

/* ───────────────────────── Mediterranean ───────────────────────── */

/** An arched window onto the sea, with a slow sun and drifting swell. */
export function ArchScene({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const animated = useContext(CardMotion);
  return (
    <svg viewBox="0 0 200 250" className={cn("overflow-visible", className)} fill="none" aria-hidden>
      <defs>
        <clipPath id={`arch-${id}`}>
          <path d="M6 250 V100 A94 94 0 0 1 194 100 V250 Z" />
        </clipPath>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--inv-soft)" />
          <stop offset="1" stopColor="var(--inv-bg)" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#arch-${id})`}>
        <rect width="200" height="250" fill={`url(#sky-${id})`} />
        <motion.circle
          cx="128"
          r="26"
          fill="var(--inv-accent2)"
          initial={animated ? { cy: 190, opacity: 0 } : { cy: 108, opacity: 1 }}
          animate={{ cy: 108, opacity: 1 }}
          transition={{ duration: 2.6, delay: 0.3, ease: EASE }}
        />
        <circle cx="128" cy="108" r="38" fill="var(--inv-accent2)" opacity="0.16" />
        <rect y="166" width="200" height="84" fill="var(--inv-accent)" />
        <g stroke="var(--inv-bg)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
          {[184, 202, 220, 238].map((y, row) => (
            <path
              key={y}
              className="animate-[sway_7s_ease-in-out_infinite]"
              style={{ animationDelay: `${row * -1.4}s`, transformOrigin: "center", transformBox: "fill-box" }}
              d={`M${-10 + row * 9} ${y} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`}
            />
          ))}
        </g>
        <path d="M0 166 H200" stroke="var(--inv-bg)" strokeOpacity="0.5" strokeWidth="0.8" />
      </g>
      <Draw
        d="M6 250 V100 A94 94 0 0 1 194 100 V250"
        stroke="var(--inv-accent)"
        strokeWidth="2.2"
        vectorEffect="non-scaling-stroke"
        duration={2}
      />
      <Draw
        d="M0 250 V100 A100 100 0 0 1 200 100 V250"
        stroke="var(--inv-accent)"
        strokeOpacity="0.4"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
        delay={0.2}
        duration={2}
      />
    </svg>
  );
}

/** A horizontal olive branch with pointed leaves and a few olives. */
export function OliveBranch({ className, delay = 0 }: { className?: string; delay?: number }) {
  const leaves = [22, 44, 66, 88, 110, 132, 154, 176];
  return (
    <svg viewBox="0 0 200 46" className={cn("overflow-visible", className)} fill="none" aria-hidden>
      <Draw d="M4 26 C52 14 148 34 196 20" stroke="var(--inv-ink)" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" delay={delay} duration={1.5} />
      {leaves.map((x, index) => {
        const up = index % 2 === 0;
        const y = 24 + Math.sin((x / 200) * Math.PI * 2) * 3.4;
        return (
          <Pop key={x} delay={delay + 0.3 + index * 0.09} origin={up ? "0% 100%" : "0% 0%"}>
            <path
              d={`M${x} ${y} q9 ${up ? -15 : 15} 22 ${up ? -15 : 15} q-5 ${up ? 13 : -13} -22 ${up ? 15 : -15}Z`}
              fill="var(--inv-ink)"
              fillOpacity={up ? 0.34 : 0.22}
              stroke="var(--inv-ink)"
              strokeOpacity="0.5"
              strokeWidth="0.6"
            />
          </Pop>
        );
      })}
      {[58, 102, 146].map((x, index) => (
        <Pop key={x} delay={delay + 1 + index * 0.12} origin="50% 50%">
          <ellipse cx={x} cy={31 + (index % 2) * 2} rx="3.4" ry="4.4" fill="var(--inv-accent2)" />
        </Pop>
      ))}
    </svg>
  );
}

/** A band of hand-painted tiles. */
export function TileStrip({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("block w-full", className)} preserveAspectRatio="xMidYMid slice" viewBox="0 0 480 40" aria-hidden>
      <defs>
        <pattern id={`tile-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="var(--inv-accent)" />
          <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="var(--inv-bg)" strokeWidth="1.4" />
          <circle cx="20" cy="20" r="5" fill="var(--inv-accent2)" />
          <circle cx="20" cy="20" r="2" fill="var(--inv-bg)" />
          <path d="M0 0 L7 0 L0 7Z M40 0 L33 0 L40 7Z M0 40 L7 40 L0 33Z M40 40 L33 40 L40 33Z" fill="var(--inv-bg)" fillOpacity="0.85" />
        </pattern>
      </defs>
      <rect width="480" height="40" fill={`url(#tile-${id})`} />
    </svg>
  );
}

/* ───────────────────────── Royal ───────────────────────── */

/** Art Deco frame: stepped corners and a sunburst fan at the head and foot. */
export function DecoFrame() {
  const fan = (cx: number, cy: number, direction: 1 | -1) =>
    Array.from({ length: 13 }, (_, i) => {
      const angle = ((12 + i * 13) * Math.PI) / 180;
      const length = i % 2 === 0 ? 46 : 32;
      const x = cx + Math.cos(angle) * length * -1;
      const y = cy + Math.sin(angle) * length * direction;
      return `M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  const corner = (x: number, y: number, sx: 1 | -1, sy: 1 | -1) =>
    `M${x} ${y + sy * 44} V${y + sy * 14} H${x + sx * 14} V${y} H${x + sx * 44} M${x + sx * 7} ${y + sy * 30} V${y + sy * 7} H${x + sx * 30}`;
  return (
    <svg viewBox="0 0 500 700" className="pointer-events-none absolute inset-0 size-full" fill="none" aria-hidden>
      <Draw d="M22 22 H478 V678 H22 Z" stroke="var(--inv-accent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" duration={2.6} />
      <Draw d="M32 32 H468 V668 H32 Z" stroke="var(--inv-accent)" strokeOpacity="0.45" strokeWidth="0.6" vectorEffect="non-scaling-stroke" delay={0.2} duration={2.6} />
      <Draw
        d={`${corner(40, 40, 1, 1)} ${corner(460, 40, -1, 1)} ${corner(40, 660, 1, -1)} ${corner(460, 660, -1, -1)}`}
        stroke="var(--inv-accent)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        delay={0.6}
        duration={1.6}
      />
      <Draw d={fan(250, 32, 1)} stroke="var(--inv-accent)" strokeOpacity="0.8" strokeWidth="0.8" vectorEffect="non-scaling-stroke" delay={0.9} duration={1.2} />
      <Draw d={fan(250, 668, -1)} stroke="var(--inv-accent)" strokeOpacity="0.8" strokeWidth="0.8" vectorEffect="non-scaling-stroke" delay={0.9} duration={1.2} />
    </svg>
  );
}

/** Four-point stars that twinkle slowly. */
export function Stars({ className }: { className?: string }) {
  const stars = [
    { x: 16, y: 21, s: 2.6, d: 0 },
    { x: 84, y: 17, s: 1.8, d: 1.2 },
    { x: 79, y: 58, s: 2.2, d: 2.1 },
    { x: 13, y: 66, s: 1.6, d: 0.7 },
    { x: 88, y: 83, s: 2.4, d: 1.7 },
    { x: 19, y: 87, s: 1.9, d: 2.6 },
  ];
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {stars.map((star) => (
        <svg
          key={`${star.x}-${star.y}`}
          viewBox="0 0 20 20"
          className="absolute animate-[twinkle_4.2s_ease-in-out_infinite]"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.s}cqw`, animationDelay: `${star.d}s` }}
        >
          <path d="M10 0 C10.6 6.4 13.6 9.4 20 10 C13.6 10.6 10.6 13.6 10 20 C9.4 13.6 6.4 10.6 0 10 C6.4 9.4 9.4 6.4 10 0Z" fill="var(--inv-accent)" />
        </svg>
      ))}
    </div>
  );
}

/** Diamond crest holding the couple's initials. */
export function Crest({ a, b, className }: { a: string; b: string; className?: string }) {
  return (
    <div className={cn("relative flex aspect-square items-center justify-center", className)}>
      <span className="absolute inset-[12%] rotate-45 border border-[color:var(--inv-accent)]" />
      <span className="absolute inset-[20%] rotate-45 border border-[color:var(--inv-accent)] opacity-40" />
      <span className="foil relative font-serif leading-none">
        {a}
        <span className="mx-[0.12em] text-[0.6em] opacity-80">·</span>
        {b}
      </span>
    </div>
  );
}
