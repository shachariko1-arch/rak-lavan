import { useId } from "react";
import type { InvitationDesign } from "@/lib/invitation/schema";

type TextureId = InvitationDesign["background"]["texture"];

const fill = "absolute inset-0 h-full w-full";

/** Full-bleed decorative texture. Pure SVG/CSS — no images, no network. */
export function Texture({ kind, tint, accent }: { kind: TextureId; tint: string; accent: string }) {
  switch (kind) {
    case "marble":
      return <Marble tint={tint} accent={accent} />;
    case "linen":
      return <Linen tint={tint} />;
    case "paper":
      return <Paper />;
    case "silk":
      return <Silk accent={accent} />;
    case "stone":
      return <Stone />;
    case "sunset":
      return <SunsetScene />;
    case "bokeh":
      return <Bokeh accent={accent} />;
    default:
      return null;
  }
}

export function Marble({ tint = "#f4efe6", accent = "#cfc3ad" }: { tint?: string; accent?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800" aria-hidden>
      <defs>
        <filter id={`${id}-m`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="4" seed="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 1.6"
          />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <radialGradient id={`${id}-v`} cx="50%" cy="40%" r="80%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill={tint} />
      <rect width="400" height="800" fill={accent} filter={`url(#${id}-m)`} opacity="0.22" />
      <rect width="400" height="800" fill={`url(#${id}-v)`} />
    </svg>
  );
}

function Linen({ tint }: { tint: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} aria-hidden>
      <defs>
        <pattern id={`${id}-l`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H6M0 3.5H6" stroke="#000" strokeOpacity="0.035" strokeWidth="0.8" />
          <path d="M0.5 0V6M3.5 0V6" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.6" />
        </pattern>
        <radialGradient id={`${id}-g`} cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-l)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-g)`} />
    </svg>
  );
}

function Paper() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} aria-hidden>
      <defs>
        <filter id={`${id}-p`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.07" />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`${id}-v`} cx="50%" cy="45%" r="75%">
          <stop offset="0.55" stopColor="#7a5c2e" stopOpacity="0" />
          <stop offset="1" stopColor="#7a5c2e" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${id}-p)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-v)`} />
    </svg>
  );
}

function Stone() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800" aria-hidden>
      <defs>
        <filter id={`${id}-s`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.035" numOctaves="5" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.26  0 0 0 0.9 -0.25" />
        </filter>
        <filter id={`${id}-n`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0.12 0" />
        </filter>
      </defs>
      <rect width="400" height="800" filter={`url(#${id}-s)`} opacity="0.35" />
      <rect width="400" height="800" filter={`url(#${id}-n)`} />
      <g stroke="#8a6d45" strokeOpacity="0.1" strokeWidth="1" fill="none">
        <path d="M0 200H400M0 420H400M0 640H400M140 0V200M300 200V420M90 420V640M250 640V800" />
      </g>
    </svg>
  );
}

function Silk({ accent }: { accent: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800" aria-hidden>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0" />
          <stop offset="0.48" stopColor={accent} stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.7" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0.2" stopColor="#24324a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#24324a" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#24324a" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter={`url(#${id}-f)`}>
        <path d="M-60 520 C 80 380, 160 640, 460 300 L 460 420 C 200 700, 80 470, -60 640 Z" fill={`url(#${id}-b)`} />
        <path d="M-80 260 C 60 140, 240 380, 480 120 L 480 210 C 260 470, 80 240, -80 380 Z" fill={`url(#${id}-a)`} />
        <path d="M-40 700 C 120 600, 260 820, 460 620 L 460 680 C 280 860, 120 680, -40 780 Z" fill={`url(#${id}-a)`} opacity="0.7" />
      </g>
    </svg>
  );
}

export function SunsetScene({ withSea = true }: { withSea?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={fill} preserveAspectRatio="xMidYMax slice" viewBox="0 0 400 800" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22344a" />
          <stop offset="0.32" stopColor="#5b4f6b" />
          <stop offset="0.52" stopColor="#c97c6d" />
          <stop offset="0.64" stopColor="#f2a981" />
          <stop offset="0.7" stopColor="#f7cf9c" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="0.45" stopColor="#ffd9a0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb07a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d99a7e" />
          <stop offset="0.25" stopColor="#6c6a80" />
          <stop offset="1" stopColor="#22344a" />
        </linearGradient>
        <linearGradient id={`${id}-glint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2b4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe2b4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-sky)`} />
      <circle cx="200" cy="545" r="150" fill={`url(#${id}-sun)`} opacity="0.75" />
      <circle cx="200" cy="560" r="46" fill="#ffe7bf" opacity="0.95" />
      {withSea && (
        <>
          <rect y="560" width="400" height="240" fill={`url(#${id}-sea)`} />
          <path d="M170 566h60M160 584h80M176 602h48M150 622h100M182 645h36M168 672h64M186 704h28" stroke={`url(#${id}-glint)`} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          <path d="M0 600h400M0 640h400M0 700h400" stroke="#fff" strokeOpacity="0.06" />
        </>
      )}
    </svg>
  );
}

function Bokeh({ accent }: { accent: string }) {
  const id = useId().replace(/:/g, "");
  const lights = [
    [60, 120, 46, 0.35], [320, 90, 60, 0.25], [210, 230, 30, 0.4], [360, 330, 40, 0.3], [40, 400, 70, 0.18],
    [150, 520, 36, 0.3], [300, 600, 64, 0.22], [90, 690, 40, 0.28], [240, 760, 50, 0.2], [380, 520, 26, 0.35],
    [120, 300, 22, 0.45], [260, 420, 18, 0.5],
  ] as const;
  return (
    <svg className={fill} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800" aria-hidden>
      <defs>
        <filter id={`${id}-b`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id={`${id}-v`} cx="50%" cy="40%" r="70%">
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-b)`}>
        {lights.map(([x, y, s, o], i) => (
          <circle key={i} cx={x} cy={y} r={s} fill={i % 3 === 0 ? "#fff1dc" : accent} opacity={o} />
        ))}
      </g>
      <rect width="400" height="800" fill={`url(#${id}-v)`} />
    </svg>
  );
}
