import { FinalCTA, Pricing } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { JsonLd, productLd } from "@/components/seo/json-ld";
import { getMarketingDict } from "@/lib/i18n/dictionaries";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  return pageMeta(getMarketingDict(locale).pricing.eyebrow, getPagesDict(locale).pricingPage.meta, "/pricing");
}

export default async function PricingPage() {
  const t = getMarketingDict(await getLocale()).pricing;
  return (
    <>
      <JsonLd data={productLd(t.plans)} />
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <Pricing withHeading={false} />
      <FinalCTA />
    </>
  );
}
