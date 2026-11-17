import { GuestManagementShowcase, InvitationExperienceDemo, WhatsAppShowcase } from "@/components/marketing/home-sections-b";
import { Features, FinalCTA } from "@/components/marketing/home-sections-c";
import { PageHero } from "@/components/marketing/page-hero";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale());
  return pageMeta(t.featuresPage.eyebrow, t.featuresPage.meta, "/features");
}

export default async function FeaturesPage() {
  const t = getPagesDict(await getLocale()).featuresPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <Features withHeading={false} />
      <InvitationExperienceDemo />
      <GuestManagementShowcase />
      <WhatsAppShowcase />
      <FinalCTA />
    </>
  );
}
