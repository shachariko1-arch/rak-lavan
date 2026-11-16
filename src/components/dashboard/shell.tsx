"use client";

import { ChartColumn, ExternalLink, LayoutDashboard, LogOut, MessageCircle, RotateCcw, ScrollText, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, LanguageToggle, Logo } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { coupleNames } from "@/lib/messaging/templates";
import { cn, daysUntil, formatWeddingDate } from "@/lib/utils";
import { DashboardProvider, useDashboard } from "./context";

function Frame({ children }: { children: ReactNode }) {
  const { tr, href, locale } = useI18n();
  const pathname = usePathname();
  const { ready, session, wedding, weddings, selectWedding, mode, resetDemo, signOut } = useDashboard();
  const { toast } = useToast();

  const nav = [
    { path: "/dashboard", label: tr("Overview", "סקירה"), icon: LayoutDashboard },
    { path: "/dashboard/guests", label: tr("Guests", "אורחים"), icon: Users },
    { path: "/dashboard/analytics", label: tr("Analytics", "נתונים"), icon: ChartColumn },
    { path: "/dashboard/messages", label: tr("WhatsApp", "וואטסאפ"), icon: MessageCircle },
    { path: "/dashboard/invitation", label: tr("Invitation", "ההזמנה"), icon: ScrollText },
  ];
  const isActive = (path: string) => (path === "/dashboard" ? pathname === href(path) : pathname?.startsWith(href(path)));

  const loading = !ready || !session;

  const days = wedding ? daysUntil(wedding.date) : 0;

  return (
    <div className="min-h-svh bg-ivory lg:ps-64">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-line bg-cream/60 px-4 py-6 lg:flex">
        <Logo href={href("/")} className="px-2" />
        {wedding ? (
          <div className="mt-8 rounded-2xl border border-line bg-white/70 p-4">
            <p className="font-serif text-xl leading-tight">{coupleNames(wedding, locale)}</p>
            <p className="mt-1 text-xs text-stone">{formatWeddingDate(wedding.date, locale, "medium")}</p>
            <p className="mt-3 text-xs font-medium text-gold-deep">
              {days > 0 ? tr(`${days} days to go`, `עוד ${days} ימים`) : days === 0 ? tr("Today", "היום") : tr("Married!", "נשואים!")}
            </p>
            {weddings.length > 1 ? (
              <select aria-label={tr("Switch wedding", "החלפת חתונה")} value={wedding.id} onChange={(e) => selectWedding(e.target.value)} className="mt-3 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-xs">
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>{coupleNames(w, locale)}</option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}
        <nav aria-label={tr("Dashboard", "לוח הבקרה")} className="mt-6 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.path}
              href={href(item.path)}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive(item.path) ? "bg-ink text-ivory shadow-card" : "text-ink-soft hover:bg-ink/5",
              )}
            >
              <item.icon aria-hidden className="size-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          {mode === "demo" ? (
            <div className="mb-3 rounded-2xl bg-champagne/50 p-3 text-xs leading-relaxed text-ink-soft">
              <p className="font-medium">{tr("Demo mode", "מצב הדגמה")}</p>
              <p className="mt-0.5 text-stone">{tr("Data is stored in this browser only.", "הנתונים נשמרים בדפדפן הזה בלבד.")}</p>
              <button type="button" onClick={async () => { await resetDemo(); toast(tr("Demo data restored", "נתוני ההדגמה שוחזרו")); }} className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
                <RotateCcw className="size-3" /> {tr("Reset demo data", "איפוס נתוני ההדגמה")}
              </button>
            </div>
          ) : null}
          <LanguageToggle className="w-full justify-start" />
          <button type="button" onClick={() => void signOut()} className="flex h-9 w-full items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-soft hover:bg-ink/5">
            <LogOut aria-hidden className="size-4 opacity-70 rtl:-scale-x-100" /> {tr("Sign out", "התנתקות")}
          </button>
          <p className="truncate px-3 pt-1 text-[11px] text-mist" dir="ltr">{session?.email}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ivory/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href={href("/")} className="text-lg" />
        <div className="flex items-center">
          <LanguageToggle />
          <button type="button" aria-label={tr("Sign out", "התנתקות")} onClick={() => void signOut()} className="flex size-9 items-center justify-center rounded-full text-stone">
            <LogOut className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1280px] px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
        {loading ? (
          <div role="status" aria-label={tr("Loading", "טוען")} className="space-y-4">
            <div className="skeleton h-12 w-72" />
            <div className="skeleton h-40 w-full" />
            <div className="skeleton h-64 w-full" />
          </div>
        ) : null}
        {/* Pages render nothing until a wedding is loaded. */}
        <Suspense fallback={null}>{children}</Suspense>
        {loading || wedding ? null : (
          <EmptyState
            icon={<Sparkles />}
            title={tr("Let's create your invitation", "בואו ניצור את ההזמנה שלכם")}
            body={tr("Your dashboard comes to life once your invitation is published.", "לוח הבקרה יתמלא ברגע שההזמנה תפורסם.")}
            action={<ButtonLink href={href("/create")}>{tr("Create your invitation", "יצירת הזמנה")}</ButtonLink>}
          />
        )}
      </main>

      {/* Mobile tab bar */}
      <nav aria-label={tr("Dashboard", "לוח הבקרה")} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {nav.map((item) => (
          <Link key={item.path} href={href(item.path)} aria-current={isActive(item.path) ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px]", isActive(item.path) ? "font-medium text-ink" : "text-stone")}>
            <item.icon aria-hidden className="size-5" strokeWidth={isActive(item.path) ? 2 : 1.5} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <Frame>{children}</Frame>
    </DashboardProvider>
  );
}

export function PageHeader({ eyebrow, title, actions, children }: { eyebrow?: string; title: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl he:text-3xl sm:he:text-4xl">{title}</h1>
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function ViewInvitationLink({ slug, locale }: { slug: string; locale: string }) {
  const { tr } = useI18n();
  return (
    <a href={`/invite/${slug}?lang=${locale}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-white/60 px-3.5 text-[13px] font-medium hover:bg-white">
      <ExternalLink className="size-3.5" /> {tr("View invitation", "צפייה בהזמנה")}
    </a>
  );
}
