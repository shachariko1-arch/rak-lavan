import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import "../fonts";
import "../globals.css";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/site";
import { isLocale } from "@/lib/types";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "he" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  const he = locale === "he";
  const title = he ? "VOW · הזמנות חתונה דיגיטליות וניהול אורחים" : "VOW · AI wedding invitations & guest management";
  const description = he
    ? "עצבו הזמנה דיגיטלית מונפשת בעזרת בינה מלאכותית, שלחו אותה בוואטסאפ ועקבו אחרי אישורי ההגעה בזמן אמת."
    : "Design an animated digital wedding invitation with AI, send it on WhatsApp and track every RSVP in real time.";
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: "%s · VOW" },
    description,
    applicationName: "VOW",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", he: "/he", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "VOW",
      title,
      description,
      locale: he ? "he_IL" : "en_US",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"} className="h-full antialiased">
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only z-[200] rounded-full bg-ink px-5 py-2.5 text-sm text-ivory focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {locale === "he" ? "דילוג לתוכן הראשי" : "Skip to main content"}
        </a>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
