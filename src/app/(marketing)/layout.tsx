import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { getMarketingDict } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { getSessionUserSafe } from "@/lib/server/auth/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = getMarketingDict(locale);
  const user = await getSessionUserSafe();
  return (
    <>
      <Navbar signedIn={!!user} />
      <main id="main" className="overflow-x-clip">{children}</main>
      <Footer t={t} />
    </>
  );
}
