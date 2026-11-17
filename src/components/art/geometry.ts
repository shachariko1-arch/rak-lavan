// Deterministic generators for the fine-line botanical artwork used by
// invitations and the marketing site. Everything is vector, tiny and crisp.

type Pt = { x: number; y: number };

const r = (n: number) => Math.round(n * 10) / 10;

/** Point and tangent angle on a quadratic Bézier. */
function quad(p0: Pt, p1: Pt, p2: Pt, t: number) {
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  return { x, y, angle: Math.atan2(dy, dx) };
}

/** Almond-shaped leaf with its base at (0,0) pointing along +x. */
function leafPath(len: number, width: number, angle: number, at: Pt) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tr = (x: number, y: number) => `${r(at.x + x * cos - y * sin)} ${r(at.y + x * sin + y * cos)}`;
  return `M${tr(0, 0)} C${tr(len * 0.3, -width)} ${tr(len * 0.75, -width * 0.8)} ${tr(len, 0)} C${tr(len * 0.75, width * 0.8)} ${tr(len * 0.3, width)} ${tr(0, 0)}Z`;
}

export type Sprig = { stem: string; leaves: string[]; berries: Pt[] };

/**
 * A curved stem with alternating leaves along its length.
 * `leafLen` / `leafWidth` control the silhouette (olive = long & thin).
 */
export function sprig(opts: {
  from: Pt;
  ctrl: Pt;
  to: Pt;
  count: number;
  leafLen: number;
  leafWidth: number;
  spread?: number;
  berries?: number;
}): Sprig {
  const { from, ctrl, to, count, leafLen, leafWidth, spread = 0.75, berries = 0 } = opts;
  const leaves: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.12 + (i / Math.max(1, count - 1)) * 0.82;
    const p = quad(from, ctrl, to, t);
    const side = i % 2 === 0 ? 1 : -1;
    const len = leafLen * (1 - t * 0.35);
    leaves.push(leafPath(len, leafWidth * (1 - t * 0.3), p.angle + side * spread, p));
  }
  // Terminal leaf at the tip.
  const tip = quad(from, ctrl, to, 1);
  leaves.push(leafPath(leafLen * 0.6, leafWidth * 0.7, tip.angle, tip));
  const berryPts: Pt[] = [];
  for (let i = 0; i < berries; i++) {
    const t = 0.25 + (i / Math.max(1, berries)) * 0.6;
    const p = quad(from, ctrl, to, t);
    const side = i % 2 === 0 ? -1 : 1;
    berryPts.push({
      x: r(p.x + Math.cos(p.angle + side * 1.2) * leafWidth * 1.8),
      y: r(p.y + Math.sin(p.angle + side * 1.2) * leafWidth * 1.8),
    });
  }
  return {
    stem: `M${r(from.x)} ${r(from.y)} Q${r(ctrl.x)} ${r(ctrl.y)} ${r(to.x)} ${r(to.y)}`,
    leaves,
    berries: berryPts,
  };
}

/** Five-petal blossom outline (line art), centred at `c`. */
export function blossom(c: Pt, size: number, rotation = 0, petals = 5) {
  const out: string[] = [];
  for (let i = 0; i < petals; i++) {
    const a = rotation + (i / petals) * Math.PI * 2;
    out.push(leafPath(size, size * 0.42, a, c));
  }
  return out;
}

/** A palm silhouette: tapered trunk + arching fronds. Base at (x, y), height h. */
export function palm(x: number, y: number, h: number, lean = 0.12) {
  const top: Pt = { x: x + h * lean, y: y - h };
  const trunk = `M${r(x - h * 0.018)} ${r(y)} Q${r(x + h * lean * 0.2)} ${r(y - h * 0.55)} ${r(top.x - h * 0.008)} ${r(top.y)} L${r(top.x + h * 0.008)} ${r(top.y)} Q${r(x + h * lean * 0.2 + h * 0.02)} ${r(y - h * 0.55)} ${r(x + h * 0.018)} ${r(y)}Z`;
  const fronds: string[] = [];
  const angles = [-2.9, -2.5, -2.1, -1.7, -1.35, -1.0, -0.6, -0.2];
  for (const a of angles) {
    const len = h * (0.42 + 0.08 * Math.cos(a * 2));
    const droop = 0.35;
    const end: Pt = { x: top.x + Math.cos(a) * len, y: top.y + Math.sin(a) * len * 0.55 + len * droop };
    const ctrl: Pt = { x: top.x + Math.cos(a) * len * 0.55, y: top.y + Math.sin(a) * len * 0.7 };
    const s = sprig({ from: top, ctrl, to: end, count: 9, leafLen: h * 0.1, leafWidth: h * 0.014, spread: 1.1 });
    fronds.push(s.stem, ...s.leaves);
  }
  return { trunk, fronds };
}
