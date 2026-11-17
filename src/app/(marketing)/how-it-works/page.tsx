import { HowItWorks } from "@/components/marketing/home-sections-a";
import { FinalCTA } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";
import { Reveal } from "@/components/motion/reveal";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale());
  return pageMeta(t.howItWorks.eyebrow, t.howItWorks.meta, "/how-it-works");
}

export default async function HowItWorksPage() {
  const t = getPagesDict(await getLocale()).howItWorks;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <HowItWorks withHeading={false} />
      <section className="border-t border-white/[.06] bg-night-2 py-24">
        <Container>
          <h2 className="font-display text-display text-pearl">{t.afterTitle}</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-white/[.08] bg-white/[.07] sm:grid-cols-2 lg:grid-cols-4">
            {t.after.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="bg-night p-8">
                <span className="font-display text-[40px] text-champagne">{String(i + 4).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-[26px] text-pearl">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-mist">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <FinalCTA />
    </>
  );
}
