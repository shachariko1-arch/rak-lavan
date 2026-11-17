import { FinalCTA } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";
import { TemplateBrowser } from "@/components/marketing/template-browser";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale());
  return pageMeta(t.templatesPage.eyebrow, t.templatesPage.meta, "/templates");
}

export default async function TemplatesPage() {
  const t = getPagesDict(await getLocale()).templatesPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24 pt-10">
        <Container>
          <TemplateBrowser allLabel={t.all} emptyLabel={t.empty} />
        </Container>
      </section>
      <FinalCTA />
    </>
  );
}
