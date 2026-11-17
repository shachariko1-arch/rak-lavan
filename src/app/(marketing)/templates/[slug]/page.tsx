import { notFound } from "next/navigation";
import { TemplatePreview } from "@/components/marketing/template-preview";
import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";
import { getTemplate, TEMPLATES } from "@/lib/invitation/templates";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">) {
  const { slug } = await params;
  const tpl = getTemplate(slug);
  if (!tpl) return {};
  const locale = await getLocale();
  return pageMeta(tpl.name[locale], tpl.description[locale], `/templates/${slug}`);
}

export default async function TemplateDetailPage({ params }: PageProps<"/templates/[slug]">) {
  const { slug } = await params;
  if (!getTemplate(slug)) notFound();
  return <TemplatePreview slug={slug} t={getPagesDict(await getLocale()).templateDetail} />;
}
