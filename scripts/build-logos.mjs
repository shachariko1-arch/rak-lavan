// Builds the VOW logo family from real Cormorant Garamond outlines.
// Output: public/brand/*.svg, src/app/icon.svg, src/app/apple-icon.png,
// and src/components/brand/logo-data.ts (path data used by <Logo />).
//
// Run: npm run brand:logos
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const fontFile = path.join(
  root,
  "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff",
);
const font = opentype.parse(fs.readFileSync(fontFile).buffer);

// ---- Wordmark ---------------------------------------------------------------
const FONT_SIZE = 100;
const TRACKING = 0.2 * FONT_SIZE; // generous editorial letter-spacing
let x = 0;
const glyphPaths = [];
for (const ch of "VOW") {
  const glyph = font.charToGlyph(ch);
  const p = glyph.getPath(x, 0, FONT_SIZE);
  glyphPaths.push(p);
  x += glyph.advanceWidth * (FONT_SIZE / font.unitsPerEm) + TRACKING;
}
x -= TRACKING;
// Bounding box of the whole word.
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const p of glyphPaths) {
  const b = p.getBoundingBox();
  minX = Math.min(minX, b.x1); minY = Math.min(minY, b.y1);
  maxX = Math.max(maxX, b.x2); maxY = Math.max(maxY, b.y2);
}
const wordW = maxX - minX;
const wordH = maxY - minY;
// Normalise to origin with 2 decimals.
const wordPath = glyphPaths
  .map((p) => serialize(p.commands, minX, minY))
  .join("");

// opentype.js 2.x toPathData() can emit NaN when rounding; serialise ourselves.
function serialize(commands, dx, dy) {
  const n = (v) => String(Math.round(v * 100) / 100);
  const X = (v) => n(v - dx);
  const Y = (v) => n(v - dy);
  return commands
    .map((c) => {
      switch (c.type) {
        case "M": return `M${X(c.x)} ${Y(c.y)}`;
        case "L": return `L${X(c.x)} ${Y(c.y)}`;
        case "Q": return `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
        case "C": return `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
        case "Z": return "Z";
        default: throw new Error("Unknown path command " + c.type);
      }
    })
    .join("");
}

// ---- Interlocking rings symbol ---------------------------------------------
// Two fine rings, offset diagonally, woven over/under with masks.
const R = 30;
const STROKE = 2.6;
const C1 = { x: 36, y: 40 };
const C2 = { x: 64, y: 32 };
const SYM_W = 100;
const SYM_H = 74;

function intersections(a, b, r) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const h = Math.sqrt(r * r - (d / 2) ** 2);
  const mx = a.x + dx / 2, my = a.y + dy / 2;
  return [
    { x: mx + (h * -dy) / d, y: my + (h * dx) / d },
    { x: mx - (h * -dy) / d, y: my - (h * dx) / d },
  ];
}
const [P1, P2] = intersections(C1, C2, R);
const GAP = STROKE * 1.35;
const f = (n) => Math.round(n * 100) / 100;

const ringsMarkup = (id, strokeA, strokeB) => `
  <defs>
    <mask id="${id}-a" maskUnits="userSpaceOnUse" x="0" y="0" width="${SYM_W}" height="${SYM_H}">
      <rect width="${SYM_W}" height="${SYM_H}" fill="#fff"/>
      <circle cx="${f(P2.x)}" cy="${f(P2.y)}" r="${f(GAP)}" fill="#000"/>
    </mask>
    <mask id="${id}-b" maskUnits="userSpaceOnUse" x="0" y="0" width="${SYM_W}" height="${SYM_H}">
      <rect width="${SYM_W}" height="${SYM_H}" fill="#fff"/>
      <circle cx="${f(P1.x)}" cy="${f(P1.y)}" r="${f(GAP)}" fill="#000"/>
    </mask>
  </defs>
  <circle cx="${C1.x}" cy="${C1.y}" r="${R}" fill="none" stroke="${strokeA}" stroke-width="${STROKE}" mask="url(#${id}-a)"/>
  <circle cx="${C2.x}" cy="${C2.y}" r="${R}" fill="none" stroke="${strokeB}" stroke-width="${STROKE}" mask="url(#${id}-b)"/>`;

const champagneGradient = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#EBD4AF"/>
    <stop offset="0.55" stop-color="#D9B98B"/>
    <stop offset="1" stop-color="#B99A70"/>
  </linearGradient>`;

// ---- Lockups ----------------------------------------------------------------
// Horizontal lockup: symbol + wordmark, wordmark scaled to symbol height.
const WORD_SCALE = 0.74;
const GAP_X = 22;
const lockW = SYM_W + GAP_X + wordW * WORD_SCALE;
const lockH = SYM_H;
const wordY = (lockH - wordH * WORD_SCALE) / 2;

function lockup({ ring, word, gradient }) {
  const gid = "vow-g";
  const ringStroke = gradient ? `url(#${gid})` : ring;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(lockW)} ${lockH}" width="${f(lockW)}" height="${lockH}" role="img" aria-label="VOW">
  <title>VOW</title>
  ${gradient ? `<defs>${champagneGradient(gid)}</defs>` : ""}
  <g>${ringsMarkup("vow-r", ringStroke, ringStroke)}</g>
  <path transform="translate(${f(SYM_W + GAP_X)} ${f(wordY)}) scale(${WORD_SCALE})" fill="${word}" d="${wordPath}"/>
</svg>
`;
}

function symbol({ ring, gradient, background, radius = 0, size = SYM_W, pad = 0 }) {
  const gid = "vow-s";
  const ringStroke = gradient ? `url(#${gid})` : ring;
  const vb = Math.max(SYM_W, SYM_H) + pad * 2;
  const ox = (vb - SYM_W) / 2;
  const oy = (vb - SYM_H) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${size}" height="${size}" role="img" aria-label="VOW">
  <title>VOW</title>
  ${gradient ? `<defs>${champagneGradient(gid)}</defs>` : ""}
  ${background ? `<rect width="${vb}" height="${vb}" rx="${radius}" fill="${background}"/>` : ""}
  <g transform="translate(${f(ox)} ${f(oy)})">${ringsMarkup("vow-sr", ringStroke, ringStroke)}</g>
</svg>
`;
}

const out = (rel, data) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log("wrote", rel);
};

out("public/brand/vow-logo-dark-bg.svg", lockup({ word: "#F4EFE6", gradient: true }));
out("public/brand/vow-logo-white.svg", lockup({ ring: "#FFFFFF", word: "#FFFFFF" }));
out("public/brand/vow-logo-black.svg", lockup({ ring: "#08090D", word: "#08090D" }));
out("public/brand/vow-symbol.svg", symbol({ gradient: true, pad: 6 }));
out("public/brand/vow-symbol-white.svg", symbol({ ring: "#FFFFFF", pad: 6 }));
out("public/brand/vow-symbol-black.svg", symbol({ ring: "#08090D", pad: 6 }));
const appIcon = symbol({ gradient: true, background: "#08090D", radius: 24, size: 512, pad: 26 });
out("public/brand/vow-app-icon.svg", appIcon);
out("src/app/icon.svg", appIcon);

await sharp(Buffer.from(appIcon)).resize(180, 180).png().toFile(path.join(root, "src/app/apple-icon.png"));
await sharp(Buffer.from(appIcon)).resize(512, 512).png().toFile(path.join(root, "public/brand/vow-app-icon-512.png"));
await sharp(Buffer.from(appIcon)).resize(192, 192).png().toFile(path.join(root, "public/brand/vow-app-icon-192.png"));
console.log("wrote png icons");

out(
  "src/components/brand/logo-data.ts",
  `// Generated by scripts/build-logos.mjs — do not edit by hand.
export const WORDMARK = { path: ${JSON.stringify(wordPath)}, width: ${f(wordW)}, height: ${f(wordH)} } as const;
export const SYMBOL = {
  width: ${SYM_W},
  height: ${SYM_H},
  r: ${R},
  stroke: ${STROKE},
  c1: { x: ${C1.x}, y: ${C1.y} },
  c2: { x: ${C2.x}, y: ${C2.y} },
  p1: { x: ${f(P1.x)}, y: ${f(P1.y)} },
  p2: { x: ${f(P2.x)}, y: ${f(P2.y)} },
  gap: ${f(GAP)},
} as const;
export const LOCKUP = { gapX: ${GAP_X}, wordScale: ${WORD_SCALE} } as const;
`,
);
