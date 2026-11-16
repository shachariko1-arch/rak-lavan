import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import type { MarketingDict } from "@/lib/i18n/dictionaries";
import { InstagramIcon, WhatsAppIcon } from "./social-icons";

export function Footer({ t }: { t: MarketingDict }) {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "/contact";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsapp = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "/contact";
  const year = new Date().getFullYear();
  const col = "text-[13.5px] text-mist transition hover:text-pearl";
  return (
    <footer className="relative border-t border-white/[.08] bg-night">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-8" />
            <p className="mt-6 max-w-xs font-display text-[22px] leading-snug text-pearl/90">{t.brand.tagline}</p>
            <div className="mt-8 flex gap-3">
              <a href={instagram} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-mist transition hover:border-champagne/60 hover:text-champagne" aria-label={t.footer.instagram} {...(instagram.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
              <a href={whatsapp} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-mist transition hover:border-champagne/60 hover:text-champagne" aria-label={t.footer.whatsapp} {...(whatsapp.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <WhatsAppIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
          <nav aria-label={t.footer.product}>
            <h3 className="eyebrow text-smoke">{t.footer.product}</h3>
            <ul className="mt-5 space-y-3">
              <li><Link className={col} href="/how-it-works">{t.footer.howItWorks}</Link></li>
              <li><Link className={col} href="/templates">{t.footer.templates}</Link></li>
              <li><Link className={col} href="/features">{t.footer.features}</Link></li>
              <li><Link className={col} href="/pricing">{t.footer.pricing}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t.footer.company}>
            <h3 className="eyebrow text-smoke">{t.footer.company}</h3>
            <ul className="mt-5 space-y-3">
              <li><Link className={col} href="/about">{t.footer.about}</Link></li>
              <li><Link className={col} href="/faq">{t.footer.faq}</Link></li>
              <li><Link className={col} href="/contact">{t.footer.contact}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t.footer.legal}>
            <h3 className="eyebrow text-smoke">{t.footer.legal}</h3>
            <ul className="mt-5 space-y-3">
              <li><Link className={col} href="/privacy">{t.footer.privacy}</Link></li>
              <li><Link className={col} href="/terms">{t.footer.terms}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/[.06] pt-8 text-[12.5px] text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.rights(year)}</p>
          <p className="eyebrow !text-[10.5px] text-smoke/80">{t.brand.category}</p>
        </div>
      </div>
    </footer>
  );
}
