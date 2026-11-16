"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";
import type { GroupBreakdown, TimelinePoint } from "@/lib/data/stats";
import { useI18n } from "@/lib/i18n";
import { STATUS_SHORT } from "@/lib/labels";
import type { RsvpStatus } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/** Status colours, validated for colour-blind separation. Charts also label every mark. */
export const STATUS_COLOR: Record<RsvpStatus, string> = {
  confirmed: "#17936b",
  declined: "#a32e2e",
  pending: "#d9a514",
  not_contacted: "#8d877e",
};

export function Legend({ items }: { items: { color: string; label: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-stone">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          {item.label}
          {item.value ? <span className="tabular font-medium text-ink">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-ivory shadow-lift">
      {children}
    </div>
  );
}

/** One horizontal bar split by RSVP status, with 2px gaps between segments. */
export function StatusBar({ counts, height = 14 }: { counts: Record<RsvpStatus, number>; height?: number }) {
  const { pick, locale } = useI18n();
  const order: RsvpStatus[] = ["confirmed", "declined", "pending", "not_contacted"];
  const total = order.reduce((s, k) => s + counts[k], 0) || 1;
  const label = order.map((k) => `${pick(STATUS_SHORT[k])} ${counts[k]}`).join(", ");
  return (
    <div role="img" aria-label={label} className="flex w-full gap-0.5 overflow-hidden rounded-full" style={{ height }}>
      {order.filter((k) => counts[k] > 0).map((k, i) => (
        <motion.div
          key={k}
          title={`${pick(STATUS_SHORT[k])}: ${formatNumber(counts[k], locale)}`}
          style={{ background: STATUS_COLOR[k] }}
          className="h-full first:rounded-s-full last:rounded-e-full"
          initial={{ width: 0 }}
          animate={{ width: `${(counts[k] / total) * 100}%` }}
          transition={{ duration: 1.1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

/** Ring gauge for a single share (response rate). */
export function Ring({ value, size = 132, label }: { value: number; size?: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(value * 100)}%`}>
      <svg viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-cream)" strokeWidth="9" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-gold)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value) }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-serif text-3xl leading-none">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}

const shortDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));

/** Responses per period: stacked confirmed/declined columns with a hover tooltip. */
export function TimelineBars({ points }: { points: TimelinePoint[] }) {
  const { tr, locale } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.confirmed + p.declined));
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  return (
    <div>
      <div className="relative flex h-52 items-end gap-1.5 border-b border-line ps-7" dir="ltr">
        {ticks.map((t) => (
          <div key={t} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/70" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="tabular absolute -top-2 start-0 text-[10px] text-mist">{t}</span>
          </div>
        ))}
        {points.map((p, i) => (
          <div key={p.date} className="relative flex h-full min-w-0 flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} role="img" aria-label={`${shortDate(p.date, locale)}: ${p.confirmed} ${tr("confirmed", "אישרו")}, ${p.declined} ${tr("declined", "סירבו")}`}>
            {hover === i ? (
              <Tip>
                <p className="mb-1 font-medium">{tr("Week of", "שבוע")} {shortDate(p.date, locale)}</p>
                <p>{tr("Confirmed", "אישרו")}: {p.confirmed}</p>
                <p>{tr("Declined", "סירבו")}: {p.declined}</p>
              </Tip>
            ) : null}
            <motion.div className="mx-auto w-full max-w-9 rounded-t-[4px]" style={{ background: STATUS_COLOR.declined }} initial={{ height: 0 }} animate={{ height: `${(p.declined / max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.04 }} />
            <motion.div className={cn("mx-auto mt-0.5 w-full max-w-9", p.declined ? "" : "rounded-t-[4px]")} style={{ background: STATUS_COLOR.confirmed }} initial={{ height: 0 }} animate={{ height: `${(p.confirmed / max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.04 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 ps-7 text-[10px] text-mist" dir="ltr">
        {points.map((p, i) => (
          <span key={p.date} className="min-w-0 flex-1 truncate text-center">{i % Math.ceil(points.length / 6) === 0 ? shortDate(p.date, locale) : ""}</span>
        ))}
      </div>
    </div>
  );
}

/** Cumulative confirmed guests over time against the number invited. */
export function ProgressLine({ points, total }: { points: TimelinePoint[]; total: number }) {
  const { tr, locale } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return <p className="py-10 text-center text-sm text-stone">{tr("Not enough responses yet.", "עדיין אין מספיק תשובות.")}</p>;
  const W = 600;
  const H = 200;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - (v / Math.max(1, total)) * H;
  const line = (key: "totalConfirmed" | "totalDeclined") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const active = hover === null ? points.length - 1 : hover;
  const p = points[active];
  return (
    <div dir="ltr">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={tr(`Confirmed invitations over time, now ${p.totalConfirmed} of ${total}`, `אישורי הגעה לאורך זמן, כעת ${p.totalConfirmed} מתוך ${total}`)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHover(Math.max(0, Math.min(points.length - 1, Math.round(((e.clientX - rect.left) / rect.width) * (points.length - 1)))));
          }}
          onMouseLeave={() => setHover(null)}
        >
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1="0" x2={W} y1={y(total * f)} y2={y(total * f)} stroke="var(--color-line)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${line("totalConfirmed")} L${W},${H} L0,${H} Z`} fill={STATUS_COLOR.confirmed} opacity="0.1" />
          <motion.path d={line("totalConfirmed")} fill="none" stroke={STATUS_COLOR.confirmed} strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
          <motion.path d={line("totalDeclined")} fill="none" stroke={STATUS_COLOR.declined} strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
          <line x1={x(active)} x2={x(active)} y1="0" y2={H} stroke="var(--color-sand)" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs text-ivory shadow-lift" style={{ left: `${Math.min(88, Math.max(12, (active / (points.length - 1)) * 100))}%` }}>
          <p className="font-medium">{shortDate(p.date, locale)}</p>
          <p>{tr("Confirmed", "אישרו")}: {p.totalConfirmed} · {tr("Declined", "סירבו")}: {p.totalDeclined}</p>
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-mist">
        <span>{shortDate(points[0].date, locale)}</span>
        <span>{tr(`${total} invited`, `${total} הוזמנו`)}</span>
        <span>{shortDate(points[points.length - 1].date, locale)}</span>
      </div>
    </div>
  );
}

/** Horizontal bars: people confirmed out of people invited, per group. */
export function GroupBars({ rows, labelOf }: { rows: GroupBreakdown[]; labelOf: (row: GroupBreakdown) => string }) {
  const { tr, locale } = useI18n();
  const max = Math.max(1, ...rows.map((r) => r.invitedHeads));
  return (
    <ul className="space-y-3.5">
      {rows.map((row, i) => (
        <li key={row.key} title={tr(`${row.attendees} attending of ${row.invitedHeads} invited · ${row.declined} declined · ${row.pending} pending`, `${row.attendees} מגיעים מתוך ${row.invitedHeads} · ${row.declined} סירבו · ${row.pending} ממתינים`)}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink-soft">{labelOf(row)}</span>
            <span className="tabular shrink-0 text-xs text-stone">
              <span className="text-sm font-medium text-ink">{formatNumber(row.attendees, locale)}</span> / {formatNumber(row.invitedHeads, locale)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-cream" style={{ width: `${Math.max(8, (row.invitedHeads / max) * 100)}%` }}>
            <motion.div className="h-full rounded-full" style={{ background: STATUS_COLOR.confirmed }} initial={{ width: 0 }} whileInView={{ width: `${(row.attendees / Math.max(1, row.invitedHeads)) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
