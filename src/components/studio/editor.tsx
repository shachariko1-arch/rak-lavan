"use client";

import { Check, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { InvitationCard } from "@/components/invitation/card";
import { Field, Input, Segmented, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { getRepository } from "@/lib/data";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, blobToDataUrl, downscaleImage } from "@/lib/data/image";
import { useI18n } from "@/lib/i18n";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import type { InviteText, Locale, Palette, Wedding } from "@/lib/types";
import { cn } from "@/lib/utils";

export type Patch = (patch: Partial<Wedding>) => void;

/** The card inside a phone-shaped frame, with a language switch. */
export function LivePreview({ wedding, locale, onLocale, className }: { wedding: Wedding; locale: Locale; onLocale: (l: Locale) => void; className?: string }) {
  const { tr } = useI18n();
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-stone"><span className="size-1.5 animate-pulse rounded-full bg-confirmed" />{tr("Live preview", "תצוגה חיה")}</span>
        <Segmented size="sm" label={tr("Preview language", "שפת התצוגה")} value={locale} onChange={onLocale} options={[{ value: "en", label: "EN" }, { value: "he", label: "עב" }]} />
      </div>
      <div className="w-full max-w-[340px] rounded-[2.6rem] border border-line bg-white p-3 shadow-lift">
        <div className="overflow-hidden rounded-[2rem] p-4" style={{ background: wedding.palette.soft }}>
          <InvitationCard key={`${wedding.templateId}-${wedding.palette.id}-${locale}`} wedding={wedding} locale={locale} animated />
        </div>
      </div>
    </div>
  );
}

export function PaletteSwatch({ palette, active, onSelect, label }: { palette: Palette; active: boolean; onSelect: () => void; label: string }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={active} className={cn("group flex items-center gap-2.5 rounded-full border py-1.5 pe-3.5 ps-1.5 text-[13px] transition-all", active ? "border-ink bg-white shadow-card" : "border-line bg-white/60 hover:border-sand")}>
      <span className="relative flex size-7 overflow-hidden rounded-full border border-black/10">
        <span className="h-full w-1/2" style={{ background: palette.bg }} />
        <span className="h-full w-1/2" style={{ background: palette.accent }} />
        <span className="absolute bottom-0 end-0 size-2.5 rounded-tl-full" style={{ background: palette.ink }} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
      {active ? <Check aria-hidden className="size-3.5" /> : null}
    </button>
  );
}

export function TemplatePicker({ wedding, patch, locale, extraPalettes = [], ranked }: { wedding: Wedding; patch: Patch; locale: Locale; extraPalettes?: Palette[]; ranked?: { id: string; score: number; reason: string }[] }) {
  const { tr, pick } = useI18n();
  const order = ranked?.length ? [...TEMPLATES].sort((a, b) => ranked.findIndex((r) => r.id === a.id) - ranked.findIndex((r) => r.id === b.id)) : TEMPLATES;
  const template = getTemplate(wedding.templateId);
  const palettes = [...extraPalettes, ...template.palettes.filter((p) => !extraPalettes.some((e) => e.id === p.id))];
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {order.map((t, i) => {
          const active = t.id === wedding.templateId;
          const match = ranked?.find((r) => r.id === t.id);
          return (
            <button key={t.id} type="button" aria-pressed={active} onClick={() => patch({ templateId: t.id, palette: extraPalettes[0] && active ? wedding.palette : t.palettes[0] })} className={cn("rounded-2xl border p-2 text-start transition-all", active ? "border-ink bg-white shadow-lift" : "border-line bg-white/50 hover:border-sand")}>
              <InvitationCard wedding={wedding} locale={locale} templateId={t.id} palette={active ? wedding.palette : t.palettes[0]} />
              <p className="mt-2 truncate text-xs font-medium">{pick(t.name)}</p>
              {match ? <p className="text-[11px] text-gold-deep">{i === 0 ? tr("Best match", "ההתאמה הטובה ביותר") : `${Math.round(match.score)}%`}</p> : null}
            </button>
          );
        })}
      </div>
      {ranked?.find((r) => r.id === wedding.templateId)?.reason ? <p className="mt-3 rounded-2xl bg-cream/70 px-4 py-3 text-sm leading-relaxed text-ink-soft">{ranked.find((r) => r.id === wedding.templateId)?.reason}</p> : null}
      <p className="mb-2 mt-5 text-[13px] font-medium text-ink-soft">{tr("Colour palette", "פלטת צבעים")}</p>
      <div className="flex flex-wrap gap-2">
        {palettes.map((p) => <PaletteSwatch key={p.id} palette={p} label={pick(p.name)} active={wedding.palette.id === p.id} onSelect={() => patch({ palette: p })} />)}
      </div>
    </div>
  );
}

export function WordingFields({ wedding, patch, locale }: { wedding: Wedding; patch: Patch; locale: Locale }) {
  const { tr } = useI18n();
  const text = wedding.text[locale];
  const set = (key: keyof InviteText, value: string) => patch({ text: { ...wedding.text, [locale]: { ...text, [key]: value } } });
  const dir = locale === "he" ? "rtl" : "ltr";
  return (
    <div className="space-y-4" lang={locale}>
      <Field label={tr("Opening line", "שורת פתיחה")} hint={tr("Above your names", "מעל השמות")}>{(f) => <Input id={f.id} dir={dir} value={text.opening} onChange={(e) => set("opening", e.target.value)} maxLength={90} />}</Field>
      <Field label={tr("Invitation line", "שורת ההזמנה")} hint={tr("Below your names", "מתחת לשמות")}>{(f) => <Input id={f.id} dir={dir} value={text.invitation} onChange={(e) => set("invitation", e.target.value)} maxLength={120} />}</Field>
      <Field label={tr("Closing line", "שורת סיום")}>{(f) => <Input id={f.id} dir={dir} value={text.closing} onChange={(e) => set("closing", e.target.value)} maxLength={90} />}</Field>
      <Field label={tr("Your introduction", "הפתיח האישי שלכם")} hint={tr("Shown under the card, revealed word by word", "מופיע מתחת להזמנה ונחשף מילה אחר מילה")}>{(f) => <Textarea id={f.id} dir={dir} rows={4} value={wedding.intro[locale]} onChange={(e) => patch({ intro: { ...wedding.intro, [locale]: e.target.value } })} maxLength={420} />}</Field>
    </div>
  );
}

export function DetailsFields({ wedding, patch, locale }: { wedding: Wedding; patch: Patch; locale: Locale }) {
  const { tr } = useI18n();
  const both = (key: "bride" | "groom" | "brideLast" | "groomLast" | "venue" | "address", value: string) => {
    const current = wedding[key];
    // Until a separate translation is entered, both languages share what was typed.
    const other = locale === "he" ? "en" : "he";
    patch({ [key]: { ...current, [locale]: value, ...(current[other] === current[locale] || !current[other] ? { [other]: value } : {}) } });
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={tr("Bride's name", "שם הכלה")}>{(f) => <Input id={f.id} value={wedding.bride[locale]} onChange={(e) => both("bride", e.target.value)} maxLength={40} autoComplete="off" />}</Field>
      <Field label={tr("Groom's name", "שם החתן")}>{(f) => <Input id={f.id} value={wedding.groom[locale]} onChange={(e) => both("groom", e.target.value)} maxLength={40} autoComplete="off" />}</Field>
      <Field label={tr("Wedding date", "תאריך החתונה")}>{(f) => <Input id={f.id} type="date" value={wedding.date} onChange={(e) => patch({ date: e.target.value })} />}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={tr("Reception", "קבלת פנים")}>{(f) => <Input id={f.id} type="time" value={wedding.receptionTime} onChange={(e) => patch({ receptionTime: e.target.value })} />}</Field>
        <Field label={tr("Ceremony", "חופה")}>{(f) => <Input id={f.id} type="time" value={wedding.ceremonyTime} onChange={(e) => patch({ ceremonyTime: e.target.value })} />}</Field>
      </div>
      <Field label={tr("Venue", "מקום האירוע")}>{(f) => <Input id={f.id} value={wedding.venue[locale]} onChange={(e) => both("venue", e.target.value)} maxLength={80} />}</Field>
      <Field label={tr("Venue address", "כתובת")}>{(f) => <Input id={f.id} value={wedding.address[locale]} onChange={(e) => both("address", e.target.value)} maxLength={140} />}</Field>
    </div>
  );
}

/** `local` keeps photos in the browser (as compact JPEG data URLs) until the wedding is published. */
export function PhotosField({ wedding, patch, max = 6, local }: { wedding: Wedding; patch: Patch; max?: number; local?: boolean }) {
  const { tr } = useI18n();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, max - wedding.photos.length)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_UPLOAD_BYTES) {
          toast(tr("Use JPG, PNG or WebP up to 12 MB", "אפשר להעלות JPG, PNG או WebP עד 12MB"), { tone: "error" });
          continue;
        }
        urls.push(local ? await blobToDataUrl(await downscaleImage(file, 1100, 0.74)) : await getRepository().uploadPhoto(file, wedding.id));
      }
      if (urls.length) patch({ photos: [...wedding.photos, ...urls] });
    } catch {
      toast(tr("The photo could not be uploaded", "לא הצלחנו להעלות את התמונה"), { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {wedding.photos.map((src, i) => (
          <div key={src.slice(-40) + i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={tr(`Photo ${i + 1}`, `תמונה ${i + 1}`)} className="size-full object-cover" />
            <button type="button" aria-label={tr(`Remove photo ${i + 1}`, `הסרת תמונה ${i + 1}`)} onClick={() => patch({ photos: wedding.photos.filter((_, j) => j !== i) })} className="absolute end-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-ink/70 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {wedding.photos.length < max ? (
          <button type="button" disabled={busy} onClick={() => input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void add(e.dataTransfer.files); }} className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sand text-xs text-stone transition hover:border-gold hover:bg-cream/60 disabled:opacity-50">
            <ImagePlus aria-hidden className="size-5 text-gold-deep" />
            {busy ? tr("Uploading…", "מעלה…") : tr("Add photo", "הוספת תמונה")}
          </button>
        ) : null}
      </div>
      <input ref={input} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} multiple className="sr-only" tabIndex={-1} aria-label={tr("Upload photos", "העלאת תמונות")} onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
