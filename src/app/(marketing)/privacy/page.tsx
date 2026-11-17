import { getPagesDict } from "@/lib/i18n/dictionaries/pages";
import { pageMeta } from "@/lib/i18n/meta";
import { getLocale } from "@/lib/i18n/server";
import { LegalPage } from "../legal";

export async function generateMetadata() {
  const t = getPagesDict(await getLocale()).privacy;
  return pageMeta(t.title, t.meta, "/privacy");
}

export default async function Page() {
  return <LegalPage t={getPagesDict(await getLocale()).privacy} />;
}
