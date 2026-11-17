"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { LanguageToggle, Logo } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Marketing header. Transparent over the hero, solid once the page scrolls. */
export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const { tr, href } = useI18n();
  const [solid, setSolid] = useState(!overHero);
  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);
  const light = overHero && !solid;
  const link = cn("link-underline hidden text-sm md:inline", light ? "text-white/85" : "text-ink-soft");
  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-500", solid ? "border-b border-line bg-ivory/85 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
        <Logo href={href("/")} tone={light ? "light" : "dark"} />
        <nav aria-label={tr("Main", "ראשי")} className="flex items-center gap-1 sm:gap-5">
          <Link href={href("/templates")} className={link}>{tr("Invitations", "הזמנות")}</Link>
          <Link href={`${href("/")}#how`} className={link}>{tr("How it works", "איך זה עובד")}</Link>
          <Link href={href("/login")} className={link}>{tr("Sign in", "התחברות")}</Link>
          <LanguageToggle tone={light ? "light" : "dark"} />
          <ButtonLink href={href("/create")} size="sm" variant={light ? "light" : "primary"} className="hidden sm:inline-flex">{tr("Create your invitation", "יצירת הזמנה")}</ButtonLink>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { tr, href } = useI18n();
  const year = 2026;
  return (
    <footer className="border-t border-line bg-cream/50">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone">{tr("Animated wedding invitations and effortless guest management.", "הזמנות חתונה מונפשות וניהול אורחים בלי מאמץ.")}</p>
        </div>
        <nav aria-label={tr("Product", "המוצר")} className="flex flex-col gap-2.5 text-sm text-ink-soft">
          <p className="eyebrow mb-1">{tr("Product", "המוצר")}</p>
          <Link className="link-underline w-fit" href={href("/create")}>{tr("Create an invitation", "יצירת הזמנה")}</Link>
          <Link className="link-underline w-fit" href={href("/templates")}>{tr("Invitation designs", "עיצובי הזמנות")}</Link>
          <Link className="link-underline w-fit" href={href("/login")}>{tr("Couple dashboard", "לוח בקרה לזוגות")}</Link>
          {/* Invitations live under their own root layout, so this is a full page load by design. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="link-underline w-fit" href="/invite/daniel-and-noa">{tr("See a live invitation", "הזמנה לדוגמה")}</a>
        </nav>
        <nav aria-label={tr("Legal", "מידע משפטי")} className="flex flex-col gap-2.5 text-sm text-ink-soft">
          <p className="eyebrow mb-1">{tr("Legal", "מידע משפטי")}</p>
          <Link className="link-underline w-fit" href={href("/privacy")}>{tr("Privacy policy", "מדיניות פרטיות")}</Link>
          <Link className="link-underline w-fit" href={href("/accessibility")}>{tr("Accessibility statement", "הצהרת נגישות")}</Link>
        </nav>
      </div>
      <p className="border-t border-line px-5 py-5 text-center text-xs text-stone">© {year} VOW</p>
    </footer>
  );
}
