"use client";

import { motion } from "framer-motion";
import { Armchair, Check, Clock, MailCheck, MessageCircle, Send, UserCheck, Users, Utensils, X, Zap } from "lucide-react";
import { useMemo } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { AnimatedNumber, Avatar, Card, StatusBadge } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { getRepository } from "@/lib/data";
import { countByStatus } from "@/lib/data/stats";
import { useI18n } from "@/lib/i18n";
import { DIETARY_LABEL } from "@/lib/labels";
import { coupleNames, guestDisplayName } from "@/lib/messaging/templates";
import { DIETARY } from "@/lib/types";
import { cn, daysUntil, formatNumber, formatRelative, formatWeddingDate } from "@/lib/utils";
import { Legend, Ring, STATUS_COLOR, StatusBar } from "./charts";
import { useDashboard } from "./context";
import { PageHeader, ViewInvitationLink } from "./shell";

export function Overview() {
  const { tr, locale, href, pick } = useI18n();
  const { wedding, guests, stats, liveIds, mode } = useDashboard();
  const { toast } = useToast();
  const counts = useMemo(() => countByStatus(guests), [guests]);
  const recent = useMemo(
    () => guests.filter((g) => g.lastResponseAt).sort((a, b) => (b.lastResponseAt as string).localeCompare(a.lastResponseAt as string)).slice(0, 7),
    [guests],
  );
  if (!wedding) return null;
  const days = daysUntil(wedding.date);

  const cards = [
    { label: tr("Invited guests", "מוזמנים"), value: stats.total, icon: Users, tone: "text-ink", sub: tr(`${formatNumber(stats.invitedHeads, locale)} people in total`, `${formatNumber(stats.invitedHeads, locale)} אנשים בסך הכול`) },
    { label: tr("Confirmed", "אישרו הגעה"), value: stats.confirmed, icon: Check, tone: "text-confirmed", sub: tr("invitations", "הזמנות") },
    { label: tr("Declined", "לא מגיעים"), value: stats.declined, icon: X, tone: "text-declined", sub: tr("invitations", "הזמנות") },
    { label: tr("Pending", "ממתינים לתשובה"), value: stats.pending + stats.notContacted, icon: Clock, tone: "text-pending-ink", sub: stats.notContacted ? tr(`${stats.notContacted} not contacted yet`, `${stats.notContacted} טרם קיבלו הזמנה`) : tr("invitations", "הזמנות") },
    { label: tr("Confirmed attendees", "סך המגיעים"), value: stats.attendees, icon: UserCheck, tone: "text-gold-deep", sub: tr(`${stats.adults} adults · ${stats.children} children`, `${stats.adults} מבוגרים · ${stats.children} ילדים`) },
    { label: tr("Response rate", "שיעור מענה"), value: stats.responseRate * 100, icon: MailCheck, tone: "text-ink", percent: true, sub: tr(`${stats.responded} of ${stats.total} replied`, `${stats.responded} מתוך ${stats.total} ענו`) },
  ];

  /** Demo helper: a random pending guest answers through the public RSVP path. */
  const simulate = async () => {
    const pending = guests.filter((g) => g.status === "pending");
    const g = pending[Math.floor(Math.random() * pending.length)];
    if (!g) return toast(tr("Everyone has already replied", "כולם כבר ענו"), { tone: "info" });
    const yes = Math.random() < 0.82;
    const size = Math.max(1, g.invitedAdults + g.invitedChildren + (g.plusOne ? 1 : 0));
    await getRepository().submitRsvp(wedding.slug, g.token, {
      attending: yes,
      party: yes ? Array.from({ length: size }, (_, i) => ({ name: i === 0 ? g.name : "", meal: "regular" as const })) : [],
      specialRequests: "",
      message: "",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow={formatWeddingDate(wedding.date, locale, "long")}
        title={coupleNames(wedding, locale)}
        actions={
          <>
            <ViewInvitationLink slug={wedding.slug} locale={locale} />
            <ButtonLink href={href("/dashboard/messages")} size="sm" icon={<Send className="size-3.5 rtl:-scale-x-100" />}>
              {tr("Send invitations", "שליחת הזמנות")}
            </ButtonLink>
          </>
        }
      >
        <p className="mt-2 text-sm text-stone">
          {pick(wedding.venue)} · {days > 0 ? tr(`${days} days to go`, `עוד ${days} ימים`) : tr("The day is here", "היום הגיע")}
        </p>
      </PageHeader>

      {/* Live counter */}
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-ink p-6 text-ivory shadow-lift sm:p-8">
        <div aria-hidden className="absolute -end-20 -top-24 size-72 rounded-full bg-gold/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-soft he:tracking-normal">
              <span className="size-2 animate-pulse-dot rounded-full bg-confirmed" />
              {tr("Live attendance", "נוכחות בזמן אמת")}
            </p>
            <p className="mt-3 flex items-baseline gap-3">
              <AnimatedNumber value={stats.attendees} className="font-serif text-7xl leading-none sm:text-8xl" />
              <span className="text-sm text-ivory/70">{tr("guests are coming", "אורחים מגיעים")}</span>
            </p>
          </div>
          <div className="w-full max-w-md">
            <StatusBar counts={counts} />
            <div className="mt-3 [&_li]:text-ivory/70 [&_span.font-medium]:!text-ivory">
              <Legend
                items={(["confirmed", "declined", "pending", "not_contacted"] as const)
                  .filter((k) => counts[k] > 0 || k !== "not_contacted")
                  .map((k) => ({ color: STATUS_COLOR[k], label: { confirmed: tr("Confirmed", "אישרו"), declined: tr("Declined", "סירבו"), pending: tr("Pending", "ממתינים"), not_contacted: tr("Not contacted", "לא נשלח") }[k], value: formatNumber(counts[k], locale) }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
            <Card className="h-full p-4 transition-shadow duration-500 hover:shadow-lift sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-stone">{card.label}</p>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-cream", card.tone)}>
                  <card.icon aria-hidden className="size-4" strokeWidth={2} />
                </span>
              </div>
              <p className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                <AnimatedNumber value={card.value} format={card.percent ? (n) => `${n.toFixed(1)}%` : undefined} />
              </p>
              <p className="mt-2 text-xs text-stone">{card.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        {/* Activity */}
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl he:text-xl">{tr("Latest replies", "תשובות אחרונות")}</h2>
            {mode === "demo" ? (
              <Button variant="soft" size="sm" icon={<Zap className="size-3.5" />} onClick={() => void simulate()}>
                {tr("Simulate an RSVP", "הדמיית תשובה")}
              </Button>
            ) : null}
          </div>
          <ul className="divide-y divide-line">
            {recent.map((g) => (
              <motion.li key={g.id} layout className={cn("flex items-center gap-3 py-3 transition-colors duration-1000", liveIds.has(g.id) && "-mx-3 rounded-xl bg-confirmed-soft/70 px-3")}>
                <Avatar name={g.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{guestDisplayName(g, locale)}</p>
                  <p className="truncate text-xs text-stone">
                    {g.status === "confirmed" ? tr(`${g.attendees} attending`, `${g.attendees} מגיעים`) : ""}
                    {g.message ? `${g.status === "confirmed" ? " · " : ""}“${g.message}”` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={g.status} />
                  <span className="text-[11px] text-mist">{formatRelative(g.lastResponseAt, locale)}</span>
                </div>
              </motion.li>
            ))}
            {!recent.length ? <li className="py-8 text-center text-sm text-stone">{tr("Replies will appear here as they arrive.", "התשובות יופיעו כאן ברגע שיגיעו.")}</li> : null}
          </ul>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card className="flex items-center gap-5 p-5 sm:p-6">
            <Ring value={stats.responseRate} label={tr("Response rate", "שיעור מענה")} />
            <div className="min-w-0">
              <h2 className="font-serif text-2xl he:text-xl">{tr("Still waiting on", "עדיין מחכים ל־")}</h2>
              <p className="mt-1 text-sm text-stone">{tr(`${stats.pending + stats.notContacted} invitations without an answer.`, `${stats.pending + stats.notContacted} הזמנות ללא תשובה.`)}</p>
              <ButtonLink href={href("/dashboard/messages")} variant="outline" size="sm" className="mt-3" icon={<MessageCircle className="size-3.5" />}>
                {tr("Send reminders", "שליחת תזכורות")}
              </ButtonLink>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-2xl he:text-xl">
              <Utensils aria-hidden className="size-4 text-gold-deep" /> {tr("For the caterer", "לקייטרינג")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {DIETARY.filter((d) => stats.meals[d] > 0).map((d) => (
                <li key={d} className="flex items-center justify-between">
                  <span className="text-ink-soft">{pick(DIETARY_LABEL[d])}</span>
                  <span className="tabular font-medium">{formatNumber(stats.meals[d], locale)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-stone">
              <Armchair aria-hidden className="size-3.5" />
              {tr(`${stats.seated} of ${stats.attendees} guests have a table`, `${stats.seated} מתוך ${stats.attendees} אורחים שובצו לשולחן`)}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
