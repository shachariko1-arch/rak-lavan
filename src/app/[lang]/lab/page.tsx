"use client";

import { InvitationCard } from "@/components/invitation/card";
import { buildDemoWedding } from "@/lib/data/demo-seed";
import { useI18n } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";

const wedding = buildDemoWedding(0);

/** Temporary visual lab for the card designs. Not linked from anywhere. */
export default function Lab() {
  const { locale } = useI18n();
  return (
    <main id="main" className="bg-cream p-8">
      <div className="grid grid-cols-3 gap-8">
        {TEMPLATES.map((t) => (
          <div key={t.id}>
            <InvitationCard wedding={wedding} locale={locale} templateId={t.id} palette={t.palettes[0]} />
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-4 gap-6">
        {wedding.photos.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
        ))}
      </div>
    </main>
  );
}
