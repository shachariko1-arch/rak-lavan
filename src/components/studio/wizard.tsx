"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Eye, LayoutDashboard, MessageCircle, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Segmented, Textarea } from "@/components/ui/form";
import { LanguageToggle, Logo, LogoMark, Tabs } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { generateLocally } from "@/lib/ai/generate";
import type { AiInput, AiResult } from "@/lib/ai/generate";
import { SlugTakenError, getRepository } from "@/lib/data";
import { extractColors } from "@/lib/data/image";
import { useI18n } from "@/lib/i18n";
import { whatsappShareLink } from "@/lib/messaging/provider";
import { coupleNames } from "@/lib/messaging/templates";
import { SITE, currentOrigin, inviteUrl } from "@/lib/site";
import { COLOR_FAMILIES, WEDDING_STYLES } from "@/lib/templates";
import type { Locale, Palette, Wedding } from "@/lib/types";
import { cn, copyText, coupleSlug, slugify } from "@/lib/utils";
import { emptyWedding, paletteFromColors, withIdentity } from "@/lib/wedding";
import { DetailsFields, LivePreview, PhotosField, TemplatePicker, WordingFields } from "./editor";

const DRAFT_KEY = "vow.wizard.v1";
type Step = "couple" | "day" | "style" | "creating" | "studio" | "published";
const FORM_STEPS: Step[] = ["couple", "day", "style"];

const toInput = (w: Wedding, locale: Locale): AiInput => ({
  bride: w.bride[locale],
  groom: w.groom[locale],
  date: w.date,
  receptionTime: w.receptionTime,
  ceremonyTime: w.ceremonyTime,
  venue: w.venue[locale],
  address: w.address[locale],
  style: w.style,
  colors: w.colors,
  message: w.personalMessage,
  photoCount: w.photos.length,
  language: locale,
});

export function Wizard() {
  const { tr, pick, locale, href, isRtl } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("couple");
  const [draft, setDraft] = useState<Wedding>(() => emptyWedding(locale));
  const [ai, setAi] = useState<AiResult | null>(null);
  const [variant, setVariant] = useState(0);
  const [intro, setIntro] = useState(0);
  const [photoPalette, setPhotoPalette] = useState<Palette | null>(null);
  const [preview, setPreview] = useState<Locale>(locale);
  const [tab, setTab] = useState<"design" | "wording" | "details" | "photos">("design");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState(0);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const restored = useRef(false);

  const patch = (p: Partial<Wedding>) => setDraft((d) => ({ ...d, ...p }));

  // Restore an unfinished draft; keep saving as they type.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "null");
      if (saved?.draft?.id) {
        setDraft(saved.draft);
        if (saved.ai) {
          setAi(saved.ai);
          setStep("studio");
        }
      }
    } catch {}
    setDraft(withIdentity);
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current || step === "published") return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, ai }));
    } catch {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft: { ...draft, photos: [] }, ai }));
      } catch {}
    }
  }, [draft, ai, step]);

  // A palette drawn from the couple's first photo.
  const firstPhoto = draft.photos[0];
  useEffect(() => {
    if (!firstPhoto) return setPhotoPalette(null);
    let alive = true;
    extractColors(firstPhoto).then((colors) => alive && setPhotoPalette(paletteFromColors(colors))).catch(() => {});
    return () => {
      alive = false;
    };
  }, [firstPhoto]);

  const validate = (which: Step): boolean => {
    const next: Record<string, string> = {};
    if (which === "couple") {
      if (!draft.bride[locale].trim()) next.bride = tr("Please enter the bride's name.", "נא להזין את שם הכלה.");
      if (!draft.groom[locale].trim()) next.groom = tr("Please enter the groom's name.", "נא להזין את שם החתן.");
    }
    if (which === "day") {
      if (!draft.date) next.date = tr("Please choose the wedding date.", "נא לבחור את תאריך החתונה.");
      if (!draft.venue[locale].trim()) next.venue = tr("Please enter the venue.", "נא להזין את מקום האירוע.");
    }
    setErrors(next);
    return !Object.keys(next).length;
  };

  const apply = (result: AiResult, v = 0, i = 0) => {
    const best = result.templates[0];
    setDraft((d) => ({
      ...d,
      templateId: best.id,
      palette: result.palettes[0] ?? d.palette,
      text: result.variants[v]?.text ?? d.text,
      intro: result.intros[i] ?? d.intro,
    }));
    setVariant(v);
    setIntro(i);
  };

  const create = async () => {
    setStep("creating");
    setPhase(0);
    const input = toInput(draft, locale);
    const ticker = window.setInterval(() => setPhase((p) => Math.min(3, p + 1)), 1100);
    const started = Date.now();
    let result: AiResult;
    try {
      const response = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error("ai_failed");
      result = (await response.json()) as AiResult;
    } catch {
      result = generateLocally(input);
    }
    // Let the reveal sequence finish even when the answer is instant.
    await new Promise((r) => setTimeout(r, Math.max(0, 4200 - (Date.now() - started))));
    window.clearInterval(ticker);
    setAi(result);
    apply(result);
    setSlug((s) => s || coupleSlug(draft.groom.en || draft.groom.he, draft.bride.en || draft.bride.he));
    setStep("studio");
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === "couple") setStep("day");
    else if (step === "day") setStep("style");
    else if (step === "style") void create();
  };
  const back = () => setStep(step === "day" ? "couple" : step === "style" ? "day" : "style");

  const publish = async () => {
    const clean = slugify(slug);
    if (clean.length < 3) return setSlugError(tr("Use at least 3 letters or numbers.", "השתמשו בשלושה תווים לפחות, באותיות לטיניות או בספרות."));
    setSlugError("");
    setPublishing(true);
    const repo = getRepository();
    try {
      if (repo.mode === "supabase" && !(await repo.getSession())) {
        toast(tr("Sign in to publish. Your draft is saved.", "התחברו כדי לפרסם. הטיוטה נשמרה."), { tone: "info" });
        router.push(`${href("/login")}?next=${encodeURIComponent(href("/create"))}`);
        return;
      }
      if (!(await repo.isSlugAvailable(clean))) return setSlugError(tr("This link is taken. Try another.", "הקישור הזה תפוס. נסו אחר."));
      let photos = draft.photos;
      if (repo.mode === "supabase") {
        photos = [];
        for (const src of draft.photos) {
          if (!src.startsWith("data:")) photos.push(src);
          else photos.push(await repo.uploadPhoto(new File([await (await fetch(src)).blob()], "photo.jpg", { type: "image/jpeg" }), draft.id));
        }
      }
      const saved = await repo.saveWedding({ ...draft, slug: clean, photos, language: locale });
      window.localStorage.setItem("vow.activeWedding", saved.id);
      window.localStorage.removeItem(DRAFT_KEY);
      setDraft(saved);
      setStep("published");
    } catch (error) {
      if (error instanceof SlugTakenError) setSlugError(tr("This link is taken. Try another.", "הקישור הזה תפוס. נסו אחר."));
      else toast(tr("Publishing failed. Try removing a photo and publish again.", "הפרסום נכשל. נסו להסיר תמונה ולפרסם שוב."), { tone: "error" });
    } finally {
      setPublishing(false);
    }
  };

  const palettes = useMemo(() => [...(photoPalette ? [photoPalette] : []), ...(ai?.palettes ?? [])], [photoPalette, ai]);
  const ranked = useMemo(() => ai?.templates.map((t) => ({ id: t.id, score: t.score, reason: pick(t.reason) })), [ai, pick]);
  const Forward = isRtl ? ArrowLeft : ArrowRight;
  const Back = isRtl ? ArrowRight : ArrowLeft;
  const index = FORM_STEPS.indexOf(step);
  const link = inviteUrl(currentOrigin(), draft.slug);

  const header = (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <Logo href={href("/")} />
      <div className="flex items-center gap-1">
        {step !== "published" && step !== "creating" ? (
          <button type="button" onClick={() => { window.localStorage.removeItem(DRAFT_KEY); setDraft(withIdentity(emptyWedding(locale))); setAi(null); setStep("couple"); }} className="hidden h-9 rounded-full px-3 text-[13px] text-stone hover:bg-ink/5 sm:block">
            {tr("Start over", "התחלה מחדש")}
          </button>
        ) : null}
        <LanguageToggle />
      </div>
    </header>
  );

  if (step === "creating") {
    const lines = [tr("Reading your story", "קוראים את הסיפור שלכם"), tr("Composing your invitation", "מנסחים את ההזמנה"), tr("Curating colour palettes", "בוחרים פלטות צבעים"), tr("Matching designs to your style", "מתאימים עיצובים לסגנון שלכם")];
    return (
      <div className="flex min-h-svh flex-col bg-ink text-ivory">
        <main id="main" className="grain relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center" aria-live="polite">
          <div aria-hidden className="absolute size-[70vmin] animate-pulse rounded-full bg-gold/20 blur-3xl" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} className="relative">
            <LogoMark className="h-14 text-gold-soft" />
          </motion.div>
          <h1 className="relative mt-10 font-serif text-4xl sm:text-5xl he:text-3xl">{tr("Creating your invitation", "יוצרים את ההזמנה שלכם")}</h1>
          <ul className="relative mt-8 space-y-3 text-start">
            {lines.map((line, i) => (
              <motion.li key={line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: i <= phase ? 1 : 0.25, y: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-3 text-sm">
                <span className={cn("flex size-5 items-center justify-center rounded-full border", i < phase ? "border-gold-soft bg-gold-soft text-ink" : "border-white/30")}>{i < phase ? <Check className="size-3" strokeWidth={3} /> : null}</span>
                {line}
              </motion.li>
            ))}
          </ul>
        </main>
      </div>
    );
  }

  if (step === "published") {
    return (
      <div className="flex min-h-svh flex-col">
        {header}
        <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="flex size-16 items-center justify-center rounded-full bg-confirmed text-white"><Check className="size-7" strokeWidth={2.5} /></motion.div>
          <h1 className="mt-6 font-serif text-5xl leading-tight he:text-4xl">{tr("Your invitation is live", "ההזמנה שלכם באוויר")}</h1>
          <p className="mt-3 text-stone">{tr("Share it with everyone, or add guests to send each one a personal link.", "שתפו אותה עם כולם, או הוסיפו אורחים כדי לשלוח לכל אחד קישור אישי.")}</p>
          <div className="mt-7 flex w-full items-center gap-2 rounded-full border border-line bg-white/80 p-1.5 ps-5">
            <span className="min-w-0 flex-1 truncate text-start text-sm" dir="ltr">{link.replace(/^https?:\/\//, "")}</span>
            <Button size="sm" variant="soft" icon={<Copy className="size-3.5" />} onClick={async () => (await copyText(link)) && toast(tr("Link copied", "הקישור הועתק"))}>{tr("Copy", "העתקה")}</Button>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <a href={`/invite/${draft.slug}`} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-ivory hover:bg-ink-soft"><ExternalLink className="size-4" />{tr("Open invitation", "פתיחת ההזמנה")}</a>
            <a href={whatsappShareLink(`${coupleNames(draft, locale)}\n${link}`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-5 text-sm font-medium hover:bg-white"><MessageCircle className="size-4" />{tr("Share on WhatsApp", "שיתוף בוואטסאפ")}</a>
            <ButtonLink href={href("/dashboard/guests")} variant="outline" icon={<LayoutDashboard className="size-4" />}>{tr("Add guests", "הוספת אורחים")}</ButtonLink>
          </div>
        </main>
      </div>
    );
  }

  const form = (
    <AnimatePresence mode="wait">
      <motion.div key={step} initial={{ opacity: 0, x: isRtl ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRtl ? 24 : -24 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        {step === "couple" ? (
          <>
            <p className="eyebrow">{tr("Step 1 of 3", "שלב 1 מתוך 3")}</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] he:text-4xl">{tr("Who is getting married?", "מי מתחתנים?")}</h1>
            <p className="mt-3 text-stone">{tr("Type your names the way they should appear on the invitation.", "כתבו את השמות כפי שתרצו שיופיעו בהזמנה.")}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label={tr("Bride's name", "שם הכלה")} error={errors.bride}>{(f) => <Input id={f.id} invalid={f.invalid} aria-describedby={f.describedBy} value={draft.bride[locale]} onChange={(e) => patch({ bride: { en: e.target.value, he: e.target.value } })} maxLength={40} autoComplete="off" />}</Field>
              <Field label={tr("Groom's name", "שם החתן")} error={errors.groom}>{(f) => <Input id={f.id} invalid={f.invalid} aria-describedby={f.describedBy} value={draft.groom[locale]} onChange={(e) => patch({ groom: { en: e.target.value, he: e.target.value } })} maxLength={40} autoComplete="off" />}</Field>
              <Field label={tr("Bride's family name", "שם משפחה של הכלה")} optional={tr("Optional", "לא חובה")}>{(f) => <Input id={f.id} value={draft.brideLast[locale]} onChange={(e) => patch({ brideLast: { en: e.target.value, he: e.target.value } })} maxLength={40} autoComplete="off" />}</Field>
              <Field label={tr("Groom's family name", "שם משפחה של החתן")} optional={tr("Optional", "לא חובה")}>{(f) => <Input id={f.id} value={draft.groomLast[locale]} onChange={(e) => patch({ groomLast: { en: e.target.value, he: e.target.value } })} maxLength={40} autoComplete="off" />}</Field>
            </div>
          </>
        ) : null}
        {step === "day" ? (
          <>
            <p className="eyebrow">{tr("Step 2 of 3", "שלב 2 מתוך 3")}</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] he:text-4xl">{tr("When and where?", "מתי ואיפה?")}</h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label={tr("Wedding date", "תאריך החתונה")} error={errors.date}>{(f) => <Input id={f.id} type="date" invalid={f.invalid} aria-describedby={f.describedBy} value={draft.date} onChange={(e) => patch({ date: e.target.value })} />}</Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={tr("Reception time", "קבלת פנים")}>{(f) => <Input id={f.id} type="time" value={draft.receptionTime} onChange={(e) => patch({ receptionTime: e.target.value })} />}</Field>
                <Field label={tr("Wedding time", "שעת החופה")}>{(f) => <Input id={f.id} type="time" value={draft.ceremonyTime} onChange={(e) => patch({ ceremonyTime: e.target.value })} />}</Field>
              </div>
              <Field label={tr("Venue", "מקום האירוע")} error={errors.venue}>{(f) => <Input id={f.id} invalid={f.invalid} aria-describedby={f.describedBy} value={draft.venue[locale]} onChange={(e) => patch({ venue: { en: e.target.value, he: e.target.value } })} maxLength={80} />}</Field>
              <Field label={tr("Venue address", "כתובת המקום")} optional={tr("Optional", "לא חובה")}>{(f) => <Input id={f.id} value={draft.address[locale]} onChange={(e) => patch({ address: { en: e.target.value, he: e.target.value } })} maxLength={140} />}</Field>
            </div>
          </>
        ) : null}
        {step === "style" ? (
          <>
            <p className="eyebrow">{tr("Step 3 of 3", "שלב 3 מתוך 3")}</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] he:text-4xl">{tr("What does it feel like?", "איך זה מרגיש?")}</h1>
            <fieldset className="mt-7">
              <legend className="text-[13px] font-medium text-ink-soft">{tr("Wedding style", "סגנון החתונה")}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {WEDDING_STYLES.map((s) => (
                  <button key={s.id} type="button" aria-pressed={draft.style === s.id} onClick={() => patch({ style: s.id })} className={cn("rounded-2xl border px-4 py-3 text-start transition-all", draft.style === s.id ? "border-ink bg-ink text-ivory shadow-lift" : "border-line bg-white/60 hover:border-sand")}>
                    <span className="block font-serif text-xl he:text-lg">{pick(s.name)}</span>
                    <span className={cn("mt-0.5 block text-xs", draft.style === s.id ? "text-ivory/70" : "text-stone")}>{pick(s.hint)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-[13px] font-medium text-ink-soft">{tr("Preferred colours", "צבעים מועדפים")} <span className="font-normal text-mist">· {tr("up to 3", "עד 3")}</span></legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_FAMILIES.map((c) => {
                  const on = draft.colors.includes(c.id);
                  return (
                    <button key={c.id} type="button" aria-pressed={on} onClick={() => patch({ colors: on ? draft.colors.filter((x) => x !== c.id) : [...draft.colors, c.id].slice(-3) })} className={cn("flex items-center gap-2 rounded-full border py-1.5 pe-3.5 ps-1.5 text-[13px] transition-all", on ? "border-ink bg-white shadow-card" : "border-line bg-white/60 hover:border-sand")}>
                      <span className="size-6 rounded-full border border-black/10" style={{ background: c.swatch }} />
                      {pick(c.name)}
                      {on ? <Check aria-hidden className="size-3.5" /> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Field className="mt-6" label={tr("A few words in your own voice", "כמה מילים בקול שלכם")} optional={tr("Optional", "לא חובה")} hint={tr("How you met, what the day means to you. AI will weave it into your introduction.", "איך הכרתם, מה היום הזה בשבילכם. הבינה המלאכותית תשלב את זה בפתיח.")}>{(f) => <Textarea id={f.id} aria-describedby={f.describedBy} rows={3} value={draft.personalMessage} onChange={(e) => patch({ personalMessage: e.target.value })} maxLength={600} />}</Field>
            <div className="mt-6">
              <p className="mb-2 text-[13px] font-medium text-ink-soft">{tr("Your photos", "התמונות שלכם")} <span className="font-normal text-mist">· {tr("optional", "לא חובה")}</span></p>
              <PhotosField wedding={draft} patch={patch} local />
            </div>
          </>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );

  const studio = ai ? (
    <div>
      <p className="eyebrow flex items-center gap-2"><Sparkles className="size-3.5" />{ai.source === "claude" ? tr("Written by Claude", "נכתב על ידי Claude") : tr("Your AI draft", "הטיוטה שלכם")}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl he:text-3xl">{tr("Make it yours", "עכשיו תורכם")}</h1>
      <p className="mt-2 text-stone">{tr("Everything here can be changed. The preview updates as you edit.", "אפשר לשנות כאן הכול. התצוגה מתעדכנת תוך כדי עריכה.")}</p>
      <div className="mt-6">
        <Tabs label={tr("Editor sections", "חלקי העורך")} value={tab} onChange={setTab} tabs={[{ value: "design", label: tr("Design", "עיצוב") }, { value: "wording", label: tr("Wording", "ניסוח") }, { value: "details", label: tr("Details", "פרטים") }, { value: "photos", label: tr("Photos", "תמונות") }]} />
      </div>
      <div className="pt-6">
        {tab === "design" ? <TemplatePicker wedding={draft} patch={patch} locale={preview} extraPalettes={palettes} ranked={ranked} /> : null}
        {tab === "wording" ? (
          <>
            <p className="text-[13px] font-medium text-ink-soft">{tr("AI wording options", "הצעות ניסוח")}</p>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
              {ai.variants.map((v, i) => (
                <button key={v.id} type="button" aria-pressed={variant === i} onClick={() => { setVariant(i); patch({ text: v.text }); }} className={cn("rounded-2xl border p-3.5 text-start transition-all", variant === i ? "border-ink bg-white shadow-lift" : "border-line bg-white/60 hover:border-sand")}>
                  <span className="text-xs font-medium text-gold-deep">{pick(v.tone)}</span>
                  <span className="mt-1.5 block font-serif text-[17px] leading-snug" lang={preview} dir={preview === "he" ? "rtl" : "ltr"}>{v.text[preview].opening}… {v.text[preview].invitation}</span>
                </button>
              ))}
            </div>
            <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
              <Segmented size="sm" label={tr("Language", "שפה")} value={preview} onChange={setPreview} options={[{ value: "en", label: "English" }, { value: "he", label: "עברית" }]} />
              <Button size="sm" variant="soft" icon={<RefreshCw className="size-3.5" />} onClick={() => { const n = (intro + 1) % ai.intros.length; setIntro(n); patch({ intro: ai.intros[n] }); }}>{tr("Another introduction", "פתיח אחר")}</Button>
            </div>
            <WordingFields wedding={draft} patch={patch} locale={preview} />
          </>
        ) : null}
        {tab === "details" ? <DetailsFields wedding={draft} patch={patch} locale={preview} /> : null}
        {tab === "photos" ? <PhotosField wedding={draft} patch={patch} local /> : null}
      </div>
      <div className="mt-8 rounded-3xl border border-line bg-white/70 p-5">
        <Field label={tr("Your invitation link", "הקישור להזמנה שלכם")} error={slugError} hint={tr("Lowercase letters, numbers and dashes.", "אותיות לטיניות קטנות, ספרות ומקפים.")}>
          {(f) => (
            <div dir="ltr" className="flex items-center rounded-xl border border-line bg-white focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
              <span className="ps-3.5 text-sm text-stone">{SITE.displayDomain}/invite/</span>
              <input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} maxLength={60} className="h-11 min-w-0 flex-1 bg-transparent pe-3 text-[15px] focus:outline-none" />
            </div>
          )}
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Button variant="gold" size="lg" loading={publishing} icon={<Sparkles className="size-4" />} onClick={() => void publish()}>{tr("Publish invitation", "פרסום ההזמנה")}</Button>
          <Button variant="ghost" icon={<WandSparkles className="size-4" />} onClick={() => void create()}>{tr("Regenerate with AI", "יצירה מחדש עם AI")}</Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex min-h-svh flex-col">
      {header}
      <div className="mx-auto grid w-full max-w-[1240px] flex-1 gap-10 px-5 pb-28 pt-4 sm:px-8 lg:grid-cols-[1fr_400px] lg:pb-16">
        <main id="main" className="min-w-0">
          {step !== "studio" ? (
            <div className="mb-8 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={index + 1} aria-label={tr("Progress", "התקדמות")}>
              {FORM_STEPS.map((s, i) => <span key={s} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= index ? "bg-ink" : "bg-line")} />)}
            </div>
          ) : null}
          {step === "studio" ? studio : form}
          {step !== "studio" ? (
            <div className="mt-10 flex items-center justify-between">
              {index > 0 ? <Button variant="ghost" icon={<Back className="size-4" />} onClick={back}>{tr("Back", "חזרה")}</Button> : <span />}
              {step === "style" ? (
                <Button variant="gold" size="lg" icon={<WandSparkles className="size-4" />} onClick={next}>{tr("Create with AI", "יצירה עם AI")}</Button>
              ) : (
                <Button size="lg" iconEnd={<Forward className="size-4" />} onClick={next}>{tr("Continue", "המשך")}</Button>
              )}
            </div>
          ) : null}
        </main>
        <aside className="hidden lg:block">
          <div className="sticky top-6"><LivePreview wedding={draft} locale={preview} onLocale={setPreview} /></div>
        </aside>
      </div>
      <button type="button" onClick={() => setMobilePreview(true)} className="fixed bottom-5 end-5 z-20 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-ivory shadow-lift lg:hidden">
        <Eye className="size-4" /> {tr("Preview", "תצוגה מקדימה")}
      </button>
      <Modal open={mobilePreview} onClose={() => setMobilePreview(false)} title={tr("Live preview", "תצוגה חיה")} size="sm">
        <LivePreview wedding={draft} locale={preview} onLocale={setPreview} />
      </Modal>
    </div>
  );
}
