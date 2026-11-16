"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InvitationCard } from "@/components/invitation/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { LanguageToggle, Logo } from "@/components/ui/misc";
import { getRepository } from "@/lib/data";
import { buildDemoWedding } from "@/lib/data/demo-seed";
import { useI18n } from "@/lib/i18n";
import { getTemplate } from "@/lib/templates";

const sample = buildDemoWedding(0);

export function LoginView() {
  const { tr, href, locale } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"demo" | "supabase">("demo");
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const go = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : href("/dashboard"));
  };

  useEffect(() => {
    const repo = getRepository();
    setMode(repo.mode);
    void repo.getSession().then((s) => s && go());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const demo = async () => {
    setBusy(true);
    await getRepository().signInDemo();
    go();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(tr("Please enter a valid e-mail address.", "נא להזין כתובת אימייל תקינה."));
    if (password.length < 8) return setError(tr("Your password needs at least 8 characters.", "הסיסמה צריכה להכיל לפחות 8 תווים."));
    setBusy(true);
    try {
      const repo = getRepository();
      const session = signup ? await repo.signUp(email, password) : await repo.signIn(email, password);
      if (session) go();
      else setNotice(tr("Almost there. Check your inbox to confirm your e-mail, then sign in.", "כמעט סיימנו. אשרו את כתובת האימייל בהודעה ששלחנו, ואז התחברו."));
    } catch {
      setError(signup ? tr("We could not create the account. Try a different e-mail.", "לא הצלחנו ליצור את החשבון. נסו כתובת אימייל אחרת.") : tr("The e-mail or password is incorrect.", "כתובת האימייל או הסיסמה שגויים."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <main id="main" className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo href={href("/")} />
          <LanguageToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow">{tr("For couples", "לזוגות")}</p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] he:text-4xl">{signup ? tr("Create your account", "יצירת חשבון") : tr("Welcome back", "ברוכים השבים")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">{tr("Your guest list, replies and invitation, in one private place.", "רשימת האורחים, התשובות וההזמנה — במקום פרטי אחד.")}</p>

          {mode === "demo" ? (
            <div className="mt-8 rounded-3xl border border-line bg-white/70 p-5">
              <p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-gold-deep" />{tr("Explore the live demo", "כניסה להדגמה חיה")}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone">{tr("Step into Noa & Daniel's wedding: 350 guests, real-time replies, everything editable.", "היכנסו לחתונה של נועה ודניאל: 350 אורחים, תשובות בזמן אמת, והכול ניתן לעריכה.")}</p>
              <Button className="mt-4 w-full" loading={busy} onClick={() => void demo()} iconEnd={<ArrowRight className="size-4 rtl:-scale-x-100" />}>{tr("Open the demo dashboard", "פתיחת לוח הבקרה")}</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 space-y-4">
              <Field label={tr("E-mail", "אימייל")}>{(f) => <Input id={f.id} type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}</Field>
              <Field label={tr("Password", "סיסמה")}>{(f) => <Input id={f.id} type="password" dir="ltr" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />}</Field>
              {error ? <p role="alert" className="rounded-xl bg-declined-soft px-4 py-3 text-sm text-declined-ink">{error}</p> : null}
              {notice ? <p role="status" className="rounded-xl bg-confirmed-soft px-4 py-3 text-sm text-confirmed-ink">{notice}</p> : null}
              <Button type="submit" className="w-full" loading={busy}>{signup ? tr("Create account", "יצירת חשבון") : tr("Sign in", "התחברות")}</Button>
              <button type="button" onClick={() => setSignup(!signup)} className="w-full text-center text-sm text-stone underline-offset-4 hover:underline">
                {signup ? tr("I already have an account", "כבר יש לי חשבון") : tr("New here? Create an account", "חדשים כאן? יצירת חשבון")}
              </button>
            </form>
          )}
          <p className="mt-8 text-sm text-stone">
            {tr("No invitation yet?", "עדיין אין לכם הזמנה?")}{" "}
            <Link href={href("/create")} className="font-medium text-ink underline underline-offset-4">{tr("Create one with AI", "צרו אחת בעזרת AI")}</Link>
          </p>
        </div>
      </main>
      <div aria-hidden className="grain relative hidden items-center justify-center overflow-hidden bg-ink lg:flex">
        <div className="absolute -start-24 top-10 size-96 rounded-full bg-gold/30 blur-3xl" />
        <div className="absolute -end-10 bottom-0 size-80 rounded-full bg-champagne/20 blur-3xl" />
        <div className="relative w-[340px] rotate-[-4deg] animate-float-slow">
          <InvitationCard wedding={sample} locale={locale} templateId="royal" palette={getTemplate("royal").palettes[0]} />
        </div>
      </div>
    </div>
  );
}
