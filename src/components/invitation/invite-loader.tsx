"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/misc";
import { getRepository } from "@/lib/data";
import { isLocale } from "@/lib/types";
import type { InvitationGuest, Locale, Wedding } from "@/lib/types";
import { InviteView } from "./invite-view";

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; wedding: Wedding; guest: InvitationGuest | null };

/** Resolves /invite/<slug>?g=<token> into a wedding and, when the token is valid, a guest. */
export function InviteLoader() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<State>({ status: "loading" });
  const [locale, setLocale] = useState<Locale>("en");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const tokenKey = `vow.guest.${slug}`;
    const token = params.get("g") || window.localStorage.getItem(tokenKey);
    setPreview(params.get("preview") === "1");
    getRepository()
      .getInvitation(slug, token)
      .then((view) => {
        if (!alive) return;
        if (!view) return setState({ status: "missing" });
        const saved = window.localStorage.getItem(`vow.lang.${slug}`);
        const wanted = params.get("lang");
        setLocale(isLocale(wanted) ? wanted : isLocale(saved) ? saved : view.wedding.language);
        setState({ status: "ready", ...view });
      })
      .catch(() => alive && setState({ status: "missing" }));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ivory" role="status" aria-label="Loading">
        <LogoMark className="h-8 animate-pulse text-gold" />
      </div>
    );
  }
  if (state.status === "missing") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-ivory px-6 text-center">
        <LogoMark className="h-8 text-gold" />
        <h1 className="mt-6 font-serif text-4xl">This invitation could not be found</h1>
        <p className="mt-2 text-stone" lang="he" dir="rtl">לא מצאנו את ההזמנה הזאת. בדקו שהקישור הועתק במלואו.</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">vow.app</Link>
      </main>
    );
  }
  return (
    <InviteView
      wedding={state.wedding}
      guest={state.guest}
      locale={locale}
      preview={preview}
      onLocale={(next) => {
        window.localStorage.setItem(`vow.lang.${slug}`, next);
        setLocale(next);
      }}
      onGuest={(guest) => {
        // Remember who answered from the public link, so they can change their reply later.
        window.localStorage.setItem(`vow.guest.${slug}`, guest.token);
        setState((s) => (s.status === "ready" ? { ...s, guest } : s));
      }}
    />
  );
}
