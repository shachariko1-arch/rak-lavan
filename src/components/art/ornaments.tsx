import { useMemo } from "react";
import type { InvitationDesign } from "@/lib/invitation/schema";
import { blossom, palm, sprig } from "./geometry";

type OrnamentId = InvitationDesign["ornament"];

/** Decorative frame layer for the invitation cover. Purely presentational. */
export function Ornament({ kind, color, initials }: { kind: OrnamentId; color: string; initials?: string }) {
  switch (kind) {
    case "botanical":
      return <BotanicalCorners color={color} />;
    case "gold-frame":
      return <GoldFrame color={color} />;
    case "palms":
      return <Palms color={color} />;
    case "geometric":
      return <Geometric color={color} />;
    case "monogram":
      return <MonogramWreath color={color} initials={initials ?? ""} />;
    case "olive":
      return <OliveBranches color={color} />;
    default:
      return null;
  }
}

const layer = "pointer-events-none absolute inset-0 h-full w-full";

export function BotanicalSpray({ color, className, flip = false }: { color: string; className?: string; flip?: boolean }) {
  const art = useMemo(() => {
    const a = sprig({ from: { x: 10, y: 190 }, ctrl: { x: 40, y: 80 }, to: { x: 150, y: 20 }, count: 9, leafLen: 22, leafWidth: 7 });
    const b = sprig({ from: { x: 18, y: 180 }, ctrl: { x: 90, y: 150 }, to: { x: 190, y: 120 }, count: 7, leafLen: 18, leafWidth: 6 });
    const c = sprig({ from: { x: 12, y: 186 }, ctrl: { x: 20, y: 110 }, to: { x: 60, y: 40 }, count: 5, leafLen: 14, leafWidth: 5 });
    const flowers = [
      ...blossom({ x: 150, y: 20 }, 13, 0.3),
      ...blossom({ x: 190, y: 120 }, 10, 0.8),
      ...blossom({ x: 98, y: 78 }, 8, 0.1),
    ];
    return { sprigs: [a, b, c], flowers };
  }, []);
  return (
    <svg viewBox="0 0 210 210" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
        {art.sprigs.map((s, i) => (
          <g key={i}>
            <path d={s.stem} />
            {s.leaves.map((d, j) => (
              <path key={j} d={d} fill={color} fillOpacity={0.08} />
            ))}
          </g>
        ))}
        {art.flowers.map((d, i) => (
          <path key={i} d={d} fill={color} fillOpacity={0.12} />
        ))}
      </g>
      <g fill={color}>
        <circle cx="150" cy="20" r="2" />
        <circle cx="190" cy="120" r="1.6" />
        <circle cx="98" cy="78" r="1.3" />
      </g>
    </svg>
  );
}

function BotanicalCorners({ color }: { color: string }) {
  return (
    <div className={layer} aria-hidden>
      <BotanicalSpray color={color} className="absolute -left-2 -top-2 w-[46%] max-w-[260px] rotate-180 opacity-90" flip />
      <BotanicalSpray color={color} className="absolute -bottom-2 -right-2 w-[52%] max-w-[300px] opacity-90" flip />
    </div>
  );
}

function GoldFrame({ color }: { color: string }) {
  return (
    <svg className={layer} preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={color} vectorEffect="non-scaling-stroke">
        <rect x="4" y="3" width="92" height="94" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeOpacity="0.85" />
        <rect x="5.6" y="4.2" width="88.8" height="91.6" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeOpacity="0.5" />
      </g>
      {[
        [4, 3],
        [96, 3],
        [4, 97],
        [96, 97],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x - 0.9}
          y={y - 0.55}
          width="1.8"
          height="1.1"
          fill={color}
          transform={`rotate(45 ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

function Palms({ color }: { color: string }) {
  const art = useMemo(() => [palm(40, 820, 330, 0.18), palm(78, 830, 250, 0.3), palm(368, 830, 300, -0.2)], []);
  return (
    <svg className={layer} preserveAspectRatio="xMidYMax slice" viewBox="0 0 400 800" aria-hidden>
      <g fill={color}>
        {art.map((p, i) => (
          <g key={i} opacity={i === 1 ? 0.75 : 1}>
            <path d={p.trunk} />
            {p.fronds.map((d, j) => (
              <path key={j} d={d} stroke={color} strokeWidth="1.2" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

function Geometric({ color }: { color: string }) {
  return (
    <svg className={layer} preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
      <g stroke={color} strokeOpacity="0.5" fill="none">
        <path d="M8 6 V94" vectorEffect="non-scaling-stroke" strokeWidth="1" />
        <path d="M92 6 V94" vectorEffect="non-scaling-stroke" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M8 6 H40" vectorEffect="non-scaling-stroke" strokeWidth="1" />
        <path d="M60 94 H92" vectorEffect="non-scaling-stroke" strokeWidth="1" />
      </g>
    </svg>
  );
}

function MonogramWreath({ color, initials }: { color: string; initials: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[7%] flex justify-center" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-20 w-20">
        <circle cx="60" cy="60" r="44" fill="none" stroke={color} strokeWidth="0.8" />
        <circle cx="60" cy="60" r="40" fill="none" stroke={color} strokeWidth="0.4" />
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill={color}
          style={{ fontFamily: "var(--inv-display)", fontSize: 26, letterSpacing: 2 }}
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

function OliveBranches({ color }: { color: string }) {
  const art = useMemo(() => {
    const top = sprig({ from: { x: 20, y: 60 }, ctrl: { x: 100, y: 10 }, to: { x: 190, y: 40 }, count: 12, leafLen: 20, leafWidth: 4.2, spread: 0.6, berries: 3 });
    const top2 = sprig({ from: { x: 380, y: 60 }, ctrl: { x: 300, y: 10 }, to: { x: 210, y: 40 }, count: 12, leafLen: 20, leafWidth: 4.2, spread: 0.6, berries: 3 });
    return [top, top2];
  }, []);
  return (
    <svg className="pointer-events-none absolute inset-x-0 top-[5%] mx-auto h-auto w-[82%]" viewBox="0 0 400 90" aria-hidden>
      <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round">
        {art.map((s, i) => (
          <g key={i}>
            <path d={s.stem} />
            {s.leaves.map((d, j) => (
              <path key={j} d={d} fill={color} fillOpacity={0.18} />
            ))}
            {s.berries.map((b, j) => (
              <ellipse key={j} cx={b.x} cy={b.y} rx="3.2" ry="4" fill={color} fillOpacity={0.55} stroke="none" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
