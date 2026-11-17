/**
 * Flowing silk + champagne light, built from layered, blurred vector folds.
 * Static SVG with a slow CSS drift (disabled under reduced motion).
 */
export function SilkHero({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,#141826_0%,#0b0c12_45%,#08090d_100%)]" />
      <svg className="silk-drift absolute -inset-[10%] h-[120%] w-[120%]" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="silk-a" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#1a2234" stopOpacity="0" />
            <stop offset="0.35" stopColor="#1f2a40" stopOpacity="0.9" />
            <stop offset="0.52" stopColor="#3b4256" />
            <stop offset="0.58" stopColor="#c9ab7f" stopOpacity="0.55" />
            <stop offset="0.66" stopColor="#262e42" stopOpacity="0.85" />
            <stop offset="1" stopColor="#0c0f17" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silk-b" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0d1018" stopOpacity="0" />
            <stop offset="0.4" stopColor="#151b29" />
            <stop offset="0.55" stopColor="#4a4a52" stopOpacity="0.9" />
            <stop offset="0.6" stopColor="#ebd4af" stopOpacity="0.35" />
            <stop offset="0.7" stopColor="#141a27" />
            <stop offset="1" stopColor="#0b0d14" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silk-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d9b98b" stopOpacity="0" />
            <stop offset="0.5" stopColor="#d9b98b" stopOpacity="0.22" />
            <stop offset="1" stopColor="#d9b98b" stopOpacity="0" />
          </linearGradient>
          <filter id="silk-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="silk-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="silk-light" cx="0.72" cy="0.38" r="0.45">
            <stop offset="0" stopColor="#ebd4af" stopOpacity="0.32" />
            <stop offset="0.4" stopColor="#d9b98b" stopOpacity="0.1" />
            <stop offset="1" stopColor="#d9b98b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1600" height="1000" fill="url(#silk-light)" />

        <g filter="url(#silk-blur)" opacity="0.95">
          <path d="M-100 760 C 260 520, 520 980, 900 640 S 1450 380, 1720 520 L 1720 700 C 1440 560, 1180 860, 860 860 S 240 760, -100 960 Z" fill="url(#silk-a)" />
          <path d="M-120 420 C 200 300, 420 620, 760 470 S 1300 160, 1720 300 L 1720 430 C 1380 300, 1080 640, 760 640 S 160 480, -120 600 Z" fill="url(#silk-b)" />
        </g>
        <g filter="url(#silk-soft)">
          <path d="M-80 600 C 300 430, 560 820, 920 560 S 1460 300, 1700 420" fill="none" stroke="url(#silk-c)" strokeWidth="28" />
          <path d="M-80 380 C 240 300, 460 560, 780 430 S 1320 190, 1700 280" fill="none" stroke="url(#silk-c)" strokeWidth="14" opacity="0.7" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_45%,rgba(217,185,139,.12),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
      <div className="grain absolute inset-0" />
      <style>{`
        @keyframes silk-drift { 0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); } 50% { transform: translate3d(-2%,1.5%,0) rotate(-1.5deg) scale(1.04); } 100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); } }
        .silk-drift { animation: silk-drift 26s ease-in-out infinite; transform-origin: 60% 50%; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .silk-drift { animation: none; } }
      `}</style>
    </div>
  );
}
