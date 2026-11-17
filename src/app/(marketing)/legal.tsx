import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";

export function LegalPage({ t }: { t: { title: string; updated: string; notice: string; sections: { h: string; p: string }[] } }) {
  return (
    <>
      <PageHero eyebrow="VOW" title={t.title} />
      <section className="pb-28 pt-10">
        <Container className="max-w-3xl">
          <p className="rounded-[12px] border border-pending/40 bg-pending/10 px-4 py-3 text-[13px] text-champagne-light">{t.notice}</p>
          <p className="mt-6 text-[13px] text-smoke">{t.updated}: 2026-11-17</p>
          {t.sections.map((s) => (
            <div key={s.h} className="mt-10">
              <h2 className="font-display text-[28px] text-pearl">{s.h}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-mist">{s.p}</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
