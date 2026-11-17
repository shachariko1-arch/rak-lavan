"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLocale } from "@/lib/i18n/client";
import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, TEMPLATES, type TemplateCategory } from "@/lib/invitation/templates";
import { cn } from "@/lib/utils";
import { TemplateCard } from "./home-sections-a";

export function TemplateBrowser({ allLabel, emptyLabel }: { allLabel: string; emptyLabel: string }) {
  const { locale } = useLocale();
  const [cat, setCat] = useState<TemplateCategory | "all">("all");
  const list = cat === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(cat));
  return (
    <>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="tablist">
        {(["all", ...TEMPLATE_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={cn("relative shrink-0 rounded-full border px-4 py-2 text-[13px] transition", cat === c ? "border-champagne text-night" : "border-white/12 text-mist hover:text-pearl")}
          >
            {cat === c && <motion.span layoutId="tpl-cat" className="absolute inset-0 -z-0 rounded-full bg-champagne" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative">{c === "all" ? allLabel : CATEGORY_LABELS[c][locale]}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((t) => (
            <motion.div key={t.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
              <TemplateCard template={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-mist">{emptyLabel}</p>}
    </>
  );
}
