import { FinalCTA } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";
import { Reveal } from "@/components/motion/reveal";
import { LogoSymbol } from "@/components/brand/logo";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale());
  return pageMeta(t.about.eyebrow, t.about.meta, "/about");
}

export default async function AboutPage() {
  const t = getPagesDict(await getLocale()).about;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} />
      <section className="py-16 sm:py-24">
        <Container className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="flex items-start justify-center lg:justify-start">
            <LogoSymbol className="h-40 w-auto opacity-90 sm:h-56" />
          </Reveal>
          <div className="space-y-7">
            {t.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? "font-display text-[26px] leading-snug text-pearl sm:text-[30px]" : "text-[17px] leading-relaxed text-mist"}>{p}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-t border-white/[.06] bg-night-2 py-24">
        <Container>
          <h2 className="font-display text-display text-pearl">{t.valuesTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="rounded-[24px] border border-white/[.08] p-8">
                <h3 className="font-display text-[28px] text-champagne">{v.title}</h3>
                <p className="mt-3 text-[15px] text-mist">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <FinalCTA />
    </>
  );
}
