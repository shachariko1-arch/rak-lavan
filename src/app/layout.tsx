import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/frank-ruhl-libre/300.css";
import "@fontsource/frank-ruhl-libre/400.css";
import "@fontsource/frank-ruhl-libre/500.css";
import "@fontsource/frank-ruhl-libre/700.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/heebo";
import "./globals.css";
import { Providers } from "@/components/providers";
import { dirOf } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "VOW — AI Wedding Invitations & Guest Management",
    template: "%s · VOW",
  },
  description:
    "Create stunning animated wedding invitations with AI, share personal links on WhatsApp and track every RSVP in real time. Hebrew & English.",
  applicationName: "VOW",
  openGraph: {
    type: "website",
    siteName: "VOW",
    title: "VOW — Your Story. Your Day. Your Invitation.",
    description: "AI-powered wedding invitations, RSVPs and guest management.",
    locale: "en_US",
    alternateLocale: ["he_IL"],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#08090D",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <body className="min-h-dvh bg-night text-pearl antialiased">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
