"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Photo } from "@/lib/invitation/schema";
import { cn } from "@/lib/utils";
import { inviteCopy } from "./copy";

/** Responsive photo grid with a full-screen, swipeable lightbox. */
export function PhotoGallery({ photos, locale }: { photos: Photo[]; locale: Locale }) {
  const t = inviteCopy[locale];
  const [index, setIndex] = useState<number | null>(null);
  const rtl = locale === "he";

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-[clamp(6px,2cqw,14px)] sm:grid-cols-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "group relative overflow-hidden rounded-[14px] focus-visible:outline-offset-2",
              i % 5 === 0 ? "col-span-2 aspect-[16/10] sm:col-span-2" : "aspect-[4/5]",
            )}
            aria-label={`${t.photo} ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
              style={{ objectPosition: `${p.focalX}% ${p.focalY}%` }}
            />
          </button>
        ))}
      </div>
      <Lightbox photos={photos} index={index} onIndex={setIndex} labels={t} rtl={rtl} />
    </>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  labels,
  rtl,
}: {
  photos: Photo[];
  index: number | null;
  onIndex: (i: number | null) => void;
  labels: (typeof inviteCopy)["en"];
  rtl: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [direction, setDirection] = useState(0);
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      setDirection(delta);
      onIndex((index + delta + photos.length) % photos.length);
    },
    [index, onIndex, photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, go, onIndex, rtl]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${labels.photo} ${index + 1} / ${photos.length}`}
          onClick={() => onIndex(null)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={photos[index].id}
              src={photos[index].url}
              alt={photos[index].alt}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 ? (rtl ? -1 : 1) : rtl ? 1 : -1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-[92vw] touch-pan-y select-none rounded-lg object-contain"
              draggable={false}
            />
          </AnimatePresence>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onIndex(null)}
            className="absolute end-4 top-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute start-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:block"
                aria-label={labels.previous}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute end-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:block"
                aria-label={labels.next}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </>
          )}
          <p className="absolute bottom-5 text-sm tabular-nums text-white/70">
            {index + 1} / {photos.length}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
