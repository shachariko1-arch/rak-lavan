import { Accordion, FinalCTA } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";
import { faqLd, JsonLd } from "@/components/seo/json-ld";
import { getMarketingDict } from "@/lib/i18n/dictionaries";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  return pageMeta(getMarketingDict(locale).faq.eyebrow, getPagesDict(locale).faqPage.meta, "/faq");
}

export default async function FaqPage() {
  const t = getMarketingDict(await getLocale());
  const all = [...t.faq.items, ...t.pricing.faq];
  return (
    <>
      <JsonLd data={faqLd(all)} />
      <PageHero eyebrow={t.faq.eyebrow} title={t.faq.title} />
      <section className="py-16 sm:py-24">
        <Container className="max-w-4xl">
          <Accordion items={t.faq.items} />
          <h2 className="mb-6 mt-20 font-display text-[34px] text-pearl">{t.pricing.faqTitle}</h2>
          <Accordion items={t.pricing.faq} />
        </Container>
      </section>
      <FinalCTA />
    </>
  );
}
