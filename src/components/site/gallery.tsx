"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { InvitationCard } from "@/components/invitation/card";
import { Particles } from "@/components/invitation/particles";
import { PaletteSwatch } from "@/components/studio/editor";
import { ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/form";
import { Reveal } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { buildDemoWedding } from "@/lib/data/demo-seed";
import { useI18n } from "@/lib/i18n";
import { TEMPLATES, resolvePalette } from "@/lib/templates";
import type { TemplateDef } from "@/lib/templates";
import type { Locale, Palette } from "@/lib/types";
import { cn } from "@/lib/utils";

const sample = buildDemoWedding(0);

/** The six designs. Each opens an interactive preview: palettes, language and a replay of its animation. */
export function TemplateGallery({ dark = false }: { dark?: boolean }) {
  const { tr, pick, locale, href } = useI18n();
  const [open, setOpen] = useState<TemplateDef | null>(null);
  const [shown, setShown] = useState<TemplateDef>(TEMPLATES[0]);
  const [palette, setPalette] = useState<Palette>(TEMPLATES[0].palettes[0]);
  const [lang, setLang] = useState<Locale>(locale);
  const [replay, setReplay] = useState(0);
  const p = resolvePalette(palette);

  const show = (t: TemplateDef) => {
    setShown(t);
    setPalette(t.palettes[0]);
    setLang(locale);
    setReplay((n) => n + 1);
    setOpen(t);
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-8">
        {TEMPLATES.map((t, i) => (
          <Reveal as="li" key={t.id} delay={(i % 3) * 0.1}>
            <button type="button" onClick={() => show(t)} className="group block w-full text-start" aria-label={tr(`Preview ${t.name.en}`, `תצוגה מקדימה: ${t.name.he}`)}>
              <div className={cn("relative overflow-hidden rounded-3xl p-5 transition-colors duration-500 sm:p-9", dark ? "bg-white/5 group-hover:bg-white/10" : "bg-cream group-hover:bg-champagne/60")}>
                <div className="transition-transform duration-700 ease-luxe group-hover:-translate-y-2 group-hover:rotate-[-1.5deg] group-hover:scale-[1.03]">
                  <InvitationCard wedding={sample} locale={locale} templateId={t.id} palette={t.palettes[0]} />
                </div>
                <span className="absolute bottom-4 start-1/2 inline-flex -translate-x-1/2 translate-y-3 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-medium text-ivory opacity-0 shadow-lift transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 rtl:translate-x-1/2">
                  <Eye className="size-3.5" /> {tr("Interactive preview", "תצוגה אינטראקטיבית")}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl he:text-xl">{pick(t.name)}</h3>
              <p className={cn("mt-1 text-sm", dark ? "text-ivory/60" : "text-stone")}>{pick(t.tagline)}</p>
            </button>
          </Reveal>
        ))}
      </ul>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} size="xl" title={pick(shown.name)} description={pick(shown.description)}>
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="relative flex items-center justify-center overflow-hidden rounded-3xl p-6 sm:p-10" style={{ background: `radial-gradient(120% 90% at 50% 20%, ${p.bg}, ${p.soft})` }}>
            <Particles kind={shown.particles} colors={[p.accent, p.accent2]} />
            <div className="relative w-full max-w-[330px]">
              <InvitationCard key={`${shown.id}-${palette.id}-${lang}-${replay}`} wedding={sample} locale={lang} templateId={shown.id} palette={palette} animated />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[13px] font-medium text-ink-soft">{tr("Colour palette", "פלטת צבעים")}</p>
              <div className="flex flex-wrap gap-2">
                {shown.palettes.map((pal) => <PaletteSwatch key={pal.id} palette={pal} label={pick(pal.name)} active={pal.id === palette.id} onSelect={() => setPalette(pal)} />)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-ink-soft">{tr("Language", "שפה")}</p>
              <Segmented label={tr("Preview language", "שפת התצוגה")} value={lang} onChange={setLang} options={[{ value: "en", label: "English" }, { value: "he", label: "עברית" }]} />
            </div>
            <button type="button" onClick={() => setReplay((n) => n + 1)} className="w-fit text-sm font-medium text-gold-deep underline-offset-4 hover:underline">{tr("Replay the animation", "הפעלת האנימציה מחדש")}</button>
            <div className="mt-auto flex flex-col gap-2 pt-2">
              <ButtonLink href={href("/create")} variant="gold">{tr("Create with this design", "יצירת הזמנה בעיצוב הזה")}</ButtonLink>
              <a href={`/invite/daniel-and-noa?lang=${lang}`} target="_blank" rel="noopener" className="text-center text-sm text-stone underline-offset-4 hover:underline">{tr("See a full live invitation", "לצפייה בהזמנה חיה מלאה")}</a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
