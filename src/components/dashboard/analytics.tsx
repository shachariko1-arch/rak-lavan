"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/form";
import { AnimatedNumber, Card } from "@/components/ui/misc";
import { breakdownBy, countByStatus, responseTimeline } from "@/lib/data/stats";
import type { GroupBreakdown } from "@/lib/data/stats";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL, DIETARY_LABEL, SIDE_LABEL } from "@/lib/labels";
import { DIETARY } from "@/lib/types";
import type { GuestCategory, Side } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { GroupBars, Legend, ProgressLine, STATUS_COLOR, StatusBar, TimelineBars } from "./charts";
import { useDashboard } from "./context";
import { PageHeader } from "./shell";

function Panel({ title, subtitle, children, aside, className }: { title: string; subtitle?: string; children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-5 sm:p-7 ${className ?? ""}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl he:text-xl">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-stone">{subtitle}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </Card>
  );
}

export function AnalyticsPage() {
  const { tr, locale, pick } = useI18n();
  const { wedding, guests, stats } = useDashboard();
  const [dimension, setDimension] = useState<"group" | "category" | "side">("group");
  const counts = useMemo(() => countByStatus(guests), [guests]);
  const weekly = useMemo(() => responseTimeline(guests, "week"), [guests]);
  const daily = useMemo(() => responseTimeline(guests, "day"), [guests]);
  const groups = useMemo(() => breakdownBy(guests, dimension), [guests, dimension]);
  if (!wedding) return null;

  const labelOf = (row: GroupBreakdown) =>
    dimension === "group" ? (locale === "he" && row.labelHe) || row.label : dimension === "category" ? pick(CATEGORY_LABEL[row.key as GuestCategory]) : pick(SIDE_LABEL[row.key as Side]);
  const answered = counts.confirmed + counts.declined || 1;
  const statusLegend = [
    { color: STATUS_COLOR.confirmed, label: tr("Confirmed", "אישרו") },
    { color: STATUS_COLOR.declined, label: tr("Declined", "סירבו") },
  ];

  return (
    <>
      <PageHeader eyebrow={tr("Insights", "תובנות")} title={tr("Analytics", "נתונים")} />

      <Card className="mb-5 flex flex-wrap items-center justify-between gap-6 p-5 sm:p-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-deep he:tracking-normal">
            <span className="size-2 animate-pulse-dot rounded-full bg-confirmed" /> {tr("Live attendance counter", "מונה נוכחות חי")}
          </p>
          <p className="mt-2 flex items-baseline gap-3">
            <AnimatedNumber value={stats.attendees} className="font-serif text-6xl leading-none sm:text-7xl" />
            <span className="text-sm text-stone">{tr(`of ${formatNumber(stats.invitedHeads, locale)} invited people`, `מתוך ${formatNumber(stats.invitedHeads, locale)} מוזמנים`)}</span>
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-6 text-center">
          {[[tr("Response rate", "שיעור מענה"), `${(stats.responseRate * 100).toFixed(1)}%`], [tr("Acceptance", "שיעור אישור"), `${(stats.acceptanceRate * 100).toFixed(1)}%`], [tr("Avg. party", "ממוצע להזמנה"), (stats.attendees / Math.max(1, stats.confirmed)).toFixed(1)]].map(([label, value]) => (
            <div key={label}>
              <dd className="tabular font-serif text-3xl">{value}</dd>
              <dt className="mt-1 text-xs text-stone">{label}</dt>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={tr("RSVP confirmation progress", "התקדמות אישורי ההגעה")} subtitle={tr("Running total of answered invitations", "סך מצטבר של הזמנות שנענו")} aside={<Legend items={statusLegend} />}>
          <ProgressLine points={daily} total={stats.total} />
        </Panel>

        <Panel title={tr("Confirmed vs declined", "אישרו מול סירבו")} subtitle={tr(`${counts.confirmed + counts.declined} invitations answered`, `${counts.confirmed + counts.declined} הזמנות נענו`)}>
          <div className="grid grid-cols-2 gap-4">
            {([["confirmed", tr("Confirmed", "אישרו")], ["declined", tr("Declined", "סירבו")]] as const).map(([key, label]) => (
              <div key={key} className="rounded-2xl bg-cream/60 p-4">
                <p className="flex items-center gap-1.5 text-xs text-stone"><span className="size-2.5 rounded-[3px]" style={{ background: STATUS_COLOR[key] }} />{label}</p>
                <p className="mt-2 font-serif text-5xl leading-none"><AnimatedNumber value={counts[key]} /></p>
                <p className="tabular mt-1.5 text-xs text-stone">{((counts[key] / answered) * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
          <div className="mt-5"><StatusBar counts={{ ...counts, pending: 0, not_contacted: 0 }} height={18} /></div>
          <p className="mt-5 mb-2 text-xs font-medium text-stone">{tr("All invitations", "כל ההזמנות")}</p>
          <StatusBar counts={counts} />
          <div className="mt-3">
            <Legend items={[...statusLegend.map((s, i) => ({ ...s, value: String(i ? counts.declined : counts.confirmed) })), { color: STATUS_COLOR.pending, label: tr("Pending", "ממתינים"), value: String(counts.pending) }, { color: STATUS_COLOR.not_contacted, label: tr("Not contacted", "לא נשלח"), value: String(counts.not_contacted) }]} />
          </div>
        </Panel>

        <Panel title={tr("Response timeline", "ציר זמן התשובות")} subtitle={tr("Replies received each week", "תשובות שהתקבלו בכל שבוע")} aside={<Legend items={statusLegend} />}>
          <TimelineBars points={weekly} />
        </Panel>

        <Panel
          title={tr("Attendance by invitation group", "נוכחות לפי קבוצת הזמנה")}
          subtitle={tr("People attending out of people invited", "מגיעים מתוך מוזמנים")}
          aside={<Segmented size="sm" label={tr("Group by", "קיבוץ לפי")} value={dimension} onChange={setDimension} options={[{ value: "group", label: tr("Group", "קבוצה") }, { value: "category", label: tr("Category", "קטגוריה") }, { value: "side", label: tr("Side", "צד") }]} />}
        >
          <GroupBars rows={groups} labelOf={labelOf} />
        </Panel>

        <Panel title={tr("Dietary preferences", "העדפות תזונה")} subtitle={tr("Meals for confirmed guests", "מנות לאורחים שאישרו")} className="lg:col-span-2">
          <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {DIETARY.map((d) => {
              const share = stats.meals[d] / Math.max(1, stats.attendees);
              return (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-ink-soft">{pick(DIETARY_LABEL[d])}</span><span className="tabular font-medium">{stats.meals[d]}</span></div>
                  <div className="h-2 rounded-full bg-cream"><div className="h-full rounded-full bg-gold transition-[width] duration-1000" style={{ width: `${share * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Table view of the same data, for screen readers and for copying */}
      <details className="mt-5 rounded-3xl border border-line bg-white/75 p-5">
        <summary className="text-sm font-medium">{tr("View as table", "הצגה כטבלה")}</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-xs text-stone"><tr className="border-b border-line">{[tr("Group", "קבוצה"), tr("Invitations", "הזמנות"), tr("Invited", "מוזמנים"), tr("Attending", "מגיעים"), tr("Declined", "סירבו"), tr("Pending", "ממתינים")].map((h) => <th key={h} scope="col" className="px-2 py-2 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody>{groups.map((r) => <tr key={r.key} className="border-b border-line/60"><th scope="row" className="px-2 py-2 text-start font-normal">{labelOf(r)}</th>{[r.invitations, r.invitedHeads, r.attendees, r.declined, r.pending + r.notContacted].map((v, i) => <td key={i} className="tabular px-2 py-2">{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </>
  );
}
