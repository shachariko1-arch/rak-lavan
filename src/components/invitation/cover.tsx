"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";
import { coupleInitials, coupleNameParts, formatWeddingDate } from "@/lib/invitation/facts";
import type { GuestPersonalization, InvitationDesign, WeddingFacts } from "@/lib/invitation/schema";
import { cn } from "@/lib/utils";
import { Ornament } from "@/components/art/ornaments";
import { Texture } from "@/components/art/textures";
import { backgroundStyle } from "./theme";
import { inviteCopy } from "./copy";

export function InvitationBackdrop({ design, priority = false }: { design: InvitationDesign; priority?: boolean }) {
  const bg = design.background;
  const hero = design.photos.hero;
  const photoAsBackground = design.layout.imagePlacement === "background" && hero;
  return (
    <div className="absolute inset-0 overflow-hidden" style={backgroundStyle(design)} aria-hidden>
      {bg.kind === "texture" && <Texture kind={bg.texture} tint={design.colors.background} accent={design.colors.accent} />}
      {bg.kind === "image" && bg.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading={priority ? "eager" : "lazy"} decoding="async" />
      )}
      {bg.kind === "video" && bg.videoUrl && (
        <video className="absolute inset-0 h-full w-full object-cover" src={bg.videoUrl} autoPlay muted loop playsInline preload="metadata" />
      )}
      {photoAsBackground && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%`, transform: `scale(${hero.zoom})`, transformOrigin: `${hero.focalX}% ${hero.focalY}%` }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      {(bg.overlay > 0 || photoAsBackground) && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${design.colors.background}00 0%, ${design.colors.background} 120%)`,
            opacity: Math.max(bg.overlay, photoAsBackground ? 0.55 : 0),
          }}
        />
      )}
    </div>
  );
}

type CoverProps = {
  design: InvitationDesign;
  facts: WeddingFacts;
  guest?: GuestPersonalization | null;
  revealed?: boolean;
  className?: string;
  priority?: boolean;
  compact?: boolean;
};

export function InvitationCover({ design, facts, guest, revealed = true, className, priority, compact }: CoverProps) {
  const reduce = useReducedMotion();
  const locale = design.language as Locale;
  const t = inviteCopy[locale];
  const [first, second] = coupleNameParts(facts);
  const variant = design.layout.variant;
  const start = design.layout.alignment === "start";
  const hero = design.photos.hero;
  const showTopPhoto = design.layout.imagePlacement === "top" && hero;
  const dateText = formatWeddingDate(facts.date, locale, "dots");
  const amp = locale === "he" ? "ו" : "&";

  const item = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: reduce ? 0.2 : 1.1, delay: reduce ? 0 : 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] as const },
  });

  const nameStyle = {
    fontFamily: "var(--inv-display)",
    fontWeight: "var(--inv-weight)" as unknown as number,
    fontStyle: "var(--inv-name-style)" as unknown as "italic",
    textTransform: "var(--inv-name-transform)" as unknown as "none",
    letterSpacing: variant === "minimal" ? "0.12em" : "var(--inv-tracking)",
  };

  return (
    <section
      className={cn("relative isolate flex min-h-full w-full flex-col overflow-hidden", className)}
      dir={locale === "he" ? "rtl" : "ltr"}
      lang={locale}
    >
      <InvitationBackdrop design={design} priority={priority} />
      <Ornament kind={design.ornament} color={design.colors.accent} initials={coupleInitials(facts)} />

      {showTopPhoto && (
        <motion.div {...item(0)} className="relative z-10 mx-auto mt-[9%] aspect-[4/5] w-[86%] max-w-[520px] overflow-hidden rounded-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.url}
            alt={hero.alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%`, transform: `scale(${hero.zoom})` }}
            loading={priority ? "eager" : "lazy"}
          />
        </motion.div>
      )}

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col px-[9%]",
          variant === "editorial" ? "justify-end pb-[14%]" : "justify-center",
          start ? "items-start text-start" : "items-center text-center",
          compact ? "py-[10%]" : "py-[16%]",
        )}
      >
        {guest?.firstName && (
          <motion.p {...item(0)} className="inv-small mb-[clamp(10px,4cqw,22px)] opacity-90" style={{ color: "var(--inv-text-2)" }}>
            {t.dear(guest.firstName)}
          </motion.p>
        )}
        <motion.p
          {...item(1)}
          className="inv-eyebrow mb-[clamp(14px,6cqw,34px)]"
          style={{ color: "var(--inv-accent)" }}
        >
          {design.content.eyebrow}
        </motion.p>

        <motion.h1 {...item(2)} className="leading-[0.95]" style={nameStyle}>
          {variant === "editorial" ? (
            <span className="inv-names-editorial block">
              <span className="block">{first}</span>
              <span className="block ps-[10%]" style={{ color: "var(--inv-accent)" }}>
                {amp === "&" ? "& " : amp}
                {second}
              </span>
            </span>
          ) : (
            <span className="inv-names flex flex-col items-[inherit]">
              <span>{first}</span>
              <span className="my-[0.08em] text-[0.48em]" style={{ color: "var(--inv-accent)", fontStyle: "italic" }}>
                {amp}
              </span>
              <span>{second}</span>
            </span>
          )}
        </motion.h1>

        <motion.div {...item(3)} className={cn("inv-gap h-px w-[clamp(48px,18cqw,120px)]", start ? "" : "mx-auto")} style={{ background: "var(--inv-accent)", opacity: 0.7 }} />

        <motion.p
          {...item(3)}
          className="inv-headline inv-caps max-w-[34em]"
          style={{ color: "var(--inv-text)" }}
        >
          {design.content.headline}
        </motion.p>

        {dateText && (
          <motion.p
            {...item(4)}
            className="inv-date mt-[clamp(12px,5cqw,30px)] tabular-nums"
            style={{ fontFamily: "var(--inv-display)", letterSpacing: "0.12em", color: "var(--inv-text)" }}
          >
            {dateText}
          </motion.p>
        )}
        {facts.city && (
          <motion.p {...item(5)} className="inv-small inv-caps mt-[clamp(6px,2cqw,12px)]" style={{ color: "var(--inv-text-2)" }}>
            {[facts.venueName, facts.city].filter(Boolean).join(" · ")}
          </motion.p>
        )}
      </div>
    </section>
  );
}
