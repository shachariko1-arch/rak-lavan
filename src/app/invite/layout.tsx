import type { Metadata, Viewport } from "next";
import "../fonts";
import "../globals.css";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "You are invited · VOW",
  description: "A wedding invitation, made with VOW.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1 };

/** Invitations have their own root layout: their language follows the wedding, not the site. */
export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <Providers locale="en">{children}</Providers>
      </body>
    </html>
  );
}
