import { ContactForm } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/section";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale());
  return pageMeta(t.contact.eyebrow, t.contact.meta, "/contact");
}

export default async function ContactPage() {
  const t = getPagesDict(await getLocale()).contact;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-28 pt-6">
        <Container className="max-w-3xl"><ContactForm t={t} /></Container>
      </section>
    </>
  );
}
