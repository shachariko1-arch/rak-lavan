"use client";

import { useEffect, useRef } from "react";
import type { ParticleKind } from "@/lib/templates";

interface P {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  phase: number;
  tone: number;
}

/** Canvas particles behind an invitation: gold dust, petals, leaves, stars or fine dust. */
export function Particles({ kind, colors, className }: { kind: ParticleKind; colors: string[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const colorKey = colors.join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || kind === "none") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const palette = colorKey.split(",");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const falling = kind === "petals" || kind === "leaves";
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let items: P[] = [];

    const spawn = (anywhere: boolean): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : falling ? -20 : h + 20,
      r: falling ? 5 + Math.random() * 7 : kind === "sparkle" ? 2 + Math.random() * 4 : 0.6 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.25,
      vy: falling ? 0.25 + Math.random() * 0.5 : -(0.08 + Math.random() * 0.25),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      tone: Math.floor(Math.random() * palette.length),
    });

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = falling ? 26000 : kind === "sparkle" ? 22000 : 9000;
      const count = Math.min(falling ? 34 : 110, Math.max(8, Math.round((w * h) / density)));
      items = Array.from({ length: count }, () => spawn(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of items) {
        const sway = Math.sin(t / 1400 + p.phase);
        p.x += p.vx + sway * (falling ? 0.35 : 0.12);
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < -30 || p.y > h + 30 || p.x < -30 || p.x > w + 30) Object.assign(p, spawn(false));
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.phase));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = palette[p.tone];
        if (falling) {
          ctx.globalAlpha = 0.55;
          ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(t / 1100 + p.phase)));
          ctx.beginPath();
          if (kind === "petals") {
            ctx.moveTo(0, -p.r);
            ctx.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.8, p.r * 0.8, 0, p.r);
            ctx.bezierCurveTo(-p.r * 0.8, p.r * 0.8, -p.r, -p.r * 0.6, 0, -p.r);
          } else {
            ctx.moveTo(-p.r * 1.3, 0);
            ctx.quadraticCurveTo(0, -p.r * 0.7, p.r * 1.3, 0);
            ctx.quadraticCurveTo(0, p.r * 0.7, -p.r * 1.3, 0);
          }
          ctx.fill();
        } else if (kind === "sparkle") {
          ctx.globalAlpha = twinkle * 0.9;
          const r = p.r * (0.6 + twinkle * 0.5);
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        } else {
          ctx.globalAlpha = twinkle * (kind === "gold" ? 0.75 : 0.4);
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const loop = (t: number) => {
      if (visible && !document.hidden) draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [kind, colorKey]);

  if (kind === "none") return null;
  return <canvas ref={ref} aria-hidden className={className ?? "pointer-events-none absolute inset-0 size-full"} />;
}
