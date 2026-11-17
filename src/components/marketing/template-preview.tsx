"use client";

import { ArrowLeft, Check, Monitor, RotateCcw, Smartphone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { InvitationExperience } from "@/components/invitation/experience";
import { Button, ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";
import type { PagesDict } from "@/lib/i18n/dictionaries/pages";
import { DEMO_FACTS } from "@/lib/invitation/facts";
import { FONT_PAIRING_MAP } from "@/lib/invitation/fonts";
import { CATEGORY_LABELS, designFromTemplate, getTemplate } from "@/lib/invitation/templates";
import { cn } from "@/lib/utils";
import { SmartphoneMockup } from "./devices";
import { Container } from "./section";

export function TemplatePreview({ slug, t }: { slug: string; t: PagesDict["templateDetail"] }) {
  const { locale } = useLocale();
  const tpl = getTemplate(slug)!;
  const design = useMemo(() => designFromTemplate(tpl, locale), [tpl, locale]);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [replay, setReplay] = useState(0);
  const demoGuest = locale === "he" ? "מאיה כהן" : "Maya Cohen";

  const preview = (
    <InvitationExperience
      key={`${replay}-${locale}-${device}`}
      design={design}
      facts={DEMO_FACTS[locale]}
      guest={{ guestName: demoGuest, firstName: demoGuest.split(" ")[0], maxAttendees: 3 }}
      rsvp={{ kind: "demo", guestName: demoGuest, maxAttendees: 3 }}
      contained
    />
  );

  return (
    <section className="pb-24 pt-32 sm:pt-36">
      <Container>
        <Link href="/templates" className="inline-flex items-center gap-2 text-[13px] text-mist hover:text-pearl">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.back}
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.35fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-champagne">{CATEGORY_LABELS[tpl.category][locale]}</p>
            <h1 className="mt-4 font-display text-display text-pearl">{tpl.name[locale]}</h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-mist">{tpl.description[locale]}</p>
            <dl className="mt-8 grid grid-cols-2 gap-5 text-[13.5px]">
              <div>
                <dt className="text-smoke">{t.palette}</dt>
                <dd className="mt-2 flex gap-1.5">{tpl.palette.map((c) => <span key={c} className="h-6 w-6 rounded-full ring-1 ring-white/15" style={{ background: c }} title={c} />)}</dd>
              </div>
              <div>
                <dt className="text-smoke">{t.typography}</dt>
                <dd className="mt-2 text-pearl">{FONT_PAIRING_MAP[tpl.base.typography.pairing].label[locale]}</dd>
              </div>
              <div>
                <dt className="text-smoke">{t.opening}</dt>
                <dd className="mt-2 capitalize text-pearl">{tpl.base.animation.opening}</dd>
              </div>
            </dl>
            <h2 className="mt-10 text-[13px] uppercase tracking-[0.18em] text-smoke">{t.includes}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5">
              {t.includesList.map((i) => (
                <li key={i} className="flex items-center gap-2 text-[14px] text-pearl/90"><Check className="h-4 w-4 text-champagne" /> {i}</li>
              ))}
            </ul>
            <ButtonLink href={`/register?template=${tpl.slug}`} size="lg" className="mt-10 w-full sm:w-auto">{t.select}</ButtonLink>
          </div>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-white/12 p-1" role="tablist">
                {(["mobile", "desktop"] as const).map((d) => (
                  <button key={d} role="tab" aria-selected={device === d} onClick={() => setDevice(d)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition", device === d ? "bg-champagne text-night" : "text-mist hover:text-pearl")}>
                    {d === "mobile" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {d === "mobile" ? t.mobile : t.desktop}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setReplay((r) => r + 1)}>{t.replay}</Button>
            </div>
            {device === "mobile" ? (
              <div className="mx-auto w-full max-w-[360px]"><SmartphoneMockup><div className="absolute inset-0">{preview}</div></SmartphoneMockup></div>
            ) : (
              <div className="overflow-hidden rounded-[18px] border border-white/12 bg-surface shadow-[var(--shadow-float)]">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                  {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}
                  <span className="mx-auto rounded-full bg-night px-4 py-1 text-[11px] text-smoke" dir="ltr">vow.app/invite/noa-and-daniel</span>
                </div>
                <div className="relative h-[640px]">{preview}</div>
              </div>
            )}
            <p className="mt-4 text-center text-[12.5px] text-smoke">{t.previewNote}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
