"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { useMarketing } from "./use-marketing";

export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const t = useMarketing();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/templates", label: t.nav.templates },
    { href: "/features", label: t.nav.features },
    { href: "/pricing", label: t.nav.pricing },
  ];

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-champagne focus:px-4 focus:py-2 focus:text-night">
        {t.nav.skip}
      </a>
      <motion.header
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Main"
          className={cn(
            "mx-auto grid max-w-[1320px] grid-cols-[1fr_auto] items-center rounded-full border px-4 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] sm:px-6 lg:grid-cols-[1fr_auto_1fr]",
            scrolled
              ? "h-14 border-white/10 bg-night/70 shadow-[0_20px_50px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl"
              : "h-[66px] border-white/[.08] bg-white/[.02] backdrop-blur-[6px]",
          )}
        >
          <Link href="/" className="justify-self-start" aria-label="VOW — home">
            <Logo className={cn("transition-all duration-500", scrolled ? "h-[22px]" : "h-[26px]")} />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-[13.5px] tracking-[0.01em] transition-colors",
                      active ? "text-pearl" : "text-mist hover:text-pearl",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {l.label}
                    {active && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 mx-auto h-px bg-champagne/80" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-self-end gap-2 sm:gap-3">
            <LanguageSwitcher label={t.nav.language} className="hidden sm:inline-flex" />
            {signedIn ? (
              <ButtonLink href="/dashboard" size="sm" className="hidden lg:inline-flex" iconEnd={<ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />}>
                {t.nav.dashboard}
              </ButtonLink>
            ) : (
              <>
                <Link href="/login" className="hidden px-2 text-[13.5px] text-mist transition hover:text-pearl lg:inline">
                  {t.nav.login}
                </Link>
                <ButtonLink href="/register" size="sm" className="hidden lg:inline-flex">
                  {t.nav.getStarted}
                </ButtonLink>
              </>
            )}
            <LanguageSwitcher label={t.nav.language} className="sm:hidden" />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-pearl transition hover:bg-white/5 lg:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 z-40 flex flex-col bg-night/96 px-6 pb-10 pt-28 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_80%_10%,rgba(217,185,139,.14),transparent)]" />
            <motion.ul
              className="relative flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
            >
              {links.map((l) => (
                <motion.li key={l.href} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}>
                  <Link href={l.href} className="flex items-center justify-between border-b border-white/[.07] py-5 font-display text-[34px] leading-none text-pearl">
                    {l.label}
                    <ArrowRight className="h-5 w-5 text-champagne/70 rtl:rotate-180" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="relative mt-auto flex flex-col gap-3">
              {signedIn ? (
                <ButtonLink href="/dashboard" size="lg" className="w-full">
                  {t.nav.dashboard}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/register" size="lg" className="w-full">
                    {t.nav.getStarted}
                  </ButtonLink>
                  <ButtonLink href="/login" variant="outline" size="lg" className="w-full">
                    {t.nav.login}
                  </ButtonLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
