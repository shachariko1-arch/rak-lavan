"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check, CheckCheck, Play, RotateCcw, UserCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { InvitationExperience } from "@/components/invitation/experience";
import { CountUp, Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";
import { DEMO_FACTS } from "@/lib/invitation/facts";
import { designFromTemplate, getTemplate } from "@/lib/invitation/templates";
import { cn } from "@/lib/utils";
import { SmartphoneMockup } from "./devices";
import { Container, SectionHeading } from "./section";
import { useMarketing } from "./use-marketing";

/* ----------------------------------------------------------- Experience */

export function InvitationExperienceDemo() {
  const t = useMarketing();
  const { locale } = useLocale();
  const [replayKey, setReplayKey] = useState(0);
  const [started, setStarted] = useState(false);
  const design = useMemo(() => designFromTemplate(getTemplate("royal-champagne")!, locale), [locale]);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_50%,rgba(217,185,139,.1),transparent)]" />
      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
        <div>
          <SectionHeading eyebrow={t.experience.eyebrow} title={t.experience.title} description={t.experience.description} />
          <ol className="mt-10 grid max-w-md grid-cols-2 gap-x-6 gap-y-3">
            {t.experience.steps.map((s, i) => (
              <Reveal key={s} delay={i * 0.06} as="li" className="flex items-center gap-3 text-[14px] text-mist">
                <span className="font-display text-[18px] text-champagne">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 flex gap-3">
            <Button
              icon={started ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              onClick={() => {
                setStarted(true);
                setReplayKey((k) => k + 1);
              }}
            >
              {started ? t.experience.replay : t.experience.play}
            </Button>
          </div>
          <p className="mt-4 text-[12.5px] text-smoke">{t.experience.hint}</p>
        </div>
        <Reveal className="mx-auto w-[300px] sm:w-[340px]">
          <SmartphoneMockup finish="graphite">
            <div className="absolute inset-0">
              <InvitationExperience
                key={`${locale}-${replayKey}`}
                design={design}
                facts={DEMO_FACTS[locale]}
                rsvp={{ kind: "demo", guestName: locale === "he" ? "מאיה כהן" : "Maya Cohen", maxAttendees: 3 }}
                guest={{ guestName: "Maya Cohen", firstName: locale === "he" ? "מאיה" : "Maya", maxAttendees: 3 }}
                contained
                autoPlayKey={started ? replayKey : 0}
              />
            </div>
          </SmartphoneMockup>
        </Reveal>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------- Guest management */

type Status = "confirmed" | "declined" | "pending" | "notContacted";
type Row = { name: string; phone: string; n: number | null; status: Status; mins: number };

const ROWS_EN: Row[] = [
  { name: "Maya Cohen", phone: "052-418-2291", n: 2, status: "confirmed", mins: 12 },
  { name: "Daniel Levi", phone: "054-771-0832", n: 3, status: "confirmed", mins: 48 },
  { name: "Tom Israel", phone: "050-336-7714", n: 0, status: "declined", mins: 95 },
  { name: "Yael Peretz", phone: "053-902-4451", n: null, status: "pending", mins: 260 },
  { name: "Ron Shahar", phone: "058-640-1187", n: null, status: "notContacted", mins: 1440 },
];
const ROWS_HE: Row[] = [
  { name: "מאיה כהן", phone: "052-418-2291", n: 2, status: "confirmed", mins: 12 },
  { name: "דניאל לוי", phone: "054-771-0832", n: 3, status: "confirmed", mins: 48 },
  { name: "תום ישראל", phone: "050-336-7714", n: 0, status: "declined", mins: 95 },
  { name: "יעל פרץ", phone: "053-902-4451", n: null, status: "pending", mins: 260 },
  { name: "רון שחר", phone: "058-640-1187", n: null, status: "notContacted", mins: 1440 },
];

const STATUS_STYLE: Record<Status, string> = {
  confirmed: "bg-confirmed/15 text-confirmed-ink",
  declined: "bg-declined/15 text-declined-ink",
  pending: "bg-pending/18 text-pending-ink",
  notContacted: "bg-uncontacted/15 text-uncontacted-ink",
};

export function GuestManagementShowcase() {
  const t = useMarketing();
  const { locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [rows, setRows] = useState<Row[]>(locale === "he" ? ROWS_HE : ROWS_EN);
  const [kpi, setKpi] = useState({ total: 350, confirmed: 218, declined: 42, pending: 90 });
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setRows(locale === "he" ? ROWS_HE : ROWS_EN), [locale]);

  const simulate = () => {
    const target = rows.find((r) => r.status === "pending" || r.status === "notContacted");
    if (!target) {
      setRows(locale === "he" ? ROWS_HE : ROWS_EN);
      setKpi({ total: 350, confirmed: 218, declined: 42, pending: 90 });
      return;
    }
    setRows((rs) => [{ ...target, status: "confirmed", n: 2, mins: 0 }, ...rs.filter((r) => r.name !== target.name)]);
    setKpi((k) => ({ ...k, confirmed: k.confirmed + 1, pending: k.pending - 1 }));
    setFlash(target.name);
    setToast(`${target.name} ${t.guests.toast}`);
    window.setTimeout(() => setFlash(null), 2200);
    window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(simulate, 1800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const responded = kpi.confirmed + kpi.declined;
  const rate = responded / kpi.total;
  const ago = (m: number) => (m === 0 ? t.guests.justNow : m < 60 ? t.guests.ago(m) : t.guests.hoursAgo(Math.round(m / 60)));

  return (
    <section className="relative bg-night-2 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t.guests.eyebrow} title={t.guests.title} description={t.guests.description} />
        <Reveal y={60} className="mt-14">
          <div ref={ref} className="theme-app relative overflow-hidden rounded-[24px] bg-paper p-4 text-ink shadow-[var(--shadow-float)] sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-sand px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-2">{t.guests.demoLabel}</span>
              <Button variant="app-outline" size="sm" onClick={simulate} icon={<UserCheck className="h-4 w-4" />}>
                {t.guests.simulate}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[
                { l: t.guests.kpis.total, v: kpi.total, c: "text-ink" },
                { l: t.guests.kpis.confirmed, v: kpi.confirmed, c: "text-confirmed-ink" },
                { l: t.guests.kpis.declined, v: kpi.declined, c: "text-declined-ink" },
                { l: t.guests.kpis.pending, v: kpi.pending, c: "text-pending-ink" },
              ].map((k) => (
                <div key={k.l} className="rounded-[14px] border border-hairline bg-card p-4">
                  <span className="text-[12px] text-ink-2">{k.l}</span>
                  <span className={cn("mt-1 block font-display text-[34px] leading-none", k.c)}>
                    <CountUp value={k.v} />
                  </span>
                </div>
              ))}
              <div className="col-span-2 rounded-[14px] border border-hairline bg-card p-4 lg:col-span-1">
                <span className="text-[12px] text-ink-2">{t.guests.kpis.rate}</span>
                <span className="mt-1 block font-display text-[34px] leading-none">
                  <CountUp value={rate * 100} format={(n) => `${n.toFixed(1)}%`} />
                </span>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand">
                  <motion.div className="h-full rounded-full bg-champagne" initial={{ width: 0 }} whileInView={{ width: `${rate * 100}%` }} viewport={{ once: true }} animate={{ width: `${rate * 100}%` }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[14px] border border-hairline bg-card">
              <table className="w-full text-start text-[13.5px]">
                <thead className="border-b border-hairline text-[11.5px] uppercase tracking-[0.12em] text-ink-2">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t.guests.table.name}</th>
                    <th className="hidden px-4 py-3 text-start font-medium sm:table-cell">{t.guests.table.phone}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.guests.table.attendees}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.guests.table.status}</th>
                    <th className="hidden px-4 py-3 text-start font-medium md:table-cell">{t.guests.table.updated}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {rows.map((r) => (
                      <motion.tr
                        key={r.name}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0, backgroundColor: flash === r.name ? "rgba(217,185,139,.18)" : "rgba(255,255,255,0)" }}
                        transition={{ duration: 0.6 }}
                        className="border-b border-hairline last:border-0"
                      >
                        <td className="px-4 py-3.5 font-medium">{r.name}</td>
                        <td className="hidden px-4 py-3.5 text-ink-2 sm:table-cell" dir="ltr">{r.phone}</td>
                        <td className="px-4 py-3.5 tabular-nums">{r.n ?? "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors duration-500", STATUS_STYLE[r.status])}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {t.guests.status[r.status]}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3.5 text-ink-2 md:table-cell">{ago(r.mins)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  className="absolute bottom-6 end-6 flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-[13px] text-white shadow-[var(--shadow-lift)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  role="status"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-confirmed"><Check className="h-3 w-3" /></span>
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------- WhatsApp */

export function WhatsAppShowcase() {
  const t = useMarketing();
  const { locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const timers = [600, 1600, 2800, 3800].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [inView]);
  const name = locale === "he" ? "מאיה" : "Maya";

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading eyebrow={t.whatsapp.eyebrow} title={t.whatsapp.title} description={t.whatsapp.description} />
          <p className="mt-8 max-w-md border-s border-champagne/40 ps-4 text-[13px] leading-relaxed text-smoke">{t.whatsapp.note}</p>
        </div>
        <div ref={ref} className="relative mx-auto flex w-full max-w-[560px] justify-center gap-5 sm:gap-8">
          <div className="w-[48%] max-w-[250px]">
            <SmartphoneMockup finish="graphite">
              <div className="flex h-full flex-col bg-[#0b141a] pt-[14%] text-[11px]" dir={locale === "he" ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2 bg-[#202c33] px-3 py-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-champagne/80 text-[11px] text-night">N&D</span>
                  <div>
                    <p className="text-[11.5px] text-white">{t.whatsapp.contact}</p>
                    <p className="text-[9.5px] text-white/50">{t.whatsapp.online}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 p-3">
                  <AnimatePresence>
                    {step >= 1 && (
                      <motion.div key="msg" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="ms-auto max-w-[88%] rounded-[10px] rounded-se-[2px] bg-[#005c4b] p-2 text-white">
                        <div className="mb-1.5 overflow-hidden rounded-[6px] bg-black/25">
                          <div className="h-12 bg-[linear-gradient(135deg,#1b1c22,#3b2f22)]" />
                          <p className="p-1.5 text-[9.5px] text-white/85">{t.whatsapp.linkTitle}</p>
                        </div>
                        <p className="whitespace-pre-line leading-snug">{t.whatsapp.message(name)}</p>
                        <p className="mt-1 text-[#53bdeb] underline" dir="ltr">{t.whatsapp.link}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[8.5px] text-white/60">19:42 <CheckCheck className="h-3 w-3 text-[#53bdeb]" /></p>
                      </motion.div>
                    )}
                    {step >= 2 && (
                      <motion.div key="reply" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-[70%] rounded-[10px] rounded-ss-[2px] bg-[#202c33] p-2 text-white">
                        {t.whatsapp.reply}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SmartphoneMockup>
          </div>
          <div className="mt-16 w-[48%] max-w-[250px]">
            <SmartphoneMockup>
              <div className="flex h-full flex-col items-center justify-center bg-[#f3ebdd] px-5 text-center text-[#2b2418]" dir={locale === "he" ? "rtl" : "ltr"}>
                <AnimatePresence mode="wait">
                  {step < 3 ? (
                    <motion.div key="form" exit={{ opacity: 0, y: -10 }} className="w-full">
                      <p className="font-display text-[22px] italic">{locale === "he" ? "נועה ודניאל" : "Noa & Daniel"}</p>
                      <div className="mt-4 space-y-2">
                        <div className="rounded-full border border-[#a8875a] bg-[#a8875a]/15 py-2 text-[11px]">{locale === "he" ? "כן, אגיע!" : "Yes, I'll be there"}</div>
                        <div className="rounded-full border border-black/15 py-2 text-[11px] opacity-60">{locale === "he" ? "לצערי לא" : "Sorry, I can't"}</div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#a8875a] text-[#a8875a]">
                        <Check className="h-6 w-6" />
                      </span>
                      <p className="mt-4 font-display text-[22px]">{t.whatsapp.confirmTitle}</p>
                      <p className="mt-1 text-[11px] opacity-70">{t.whatsapp.confirmText}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SmartphoneMockup>
          </div>
        </div>
      </Container>
    </section>
  );
}
