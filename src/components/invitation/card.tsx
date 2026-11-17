"use client";

import { motion } from "framer-motion";
import { useContext, useMemo } from "react";
import type { CSSProperties } from "react";
import { getTemplate, paletteVars } from "@/lib/templates";
import type { Locale, Palette, TemplateId, Wedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildCardData, fitSize } from "./card-data";
import type { CardData } from "./card-data";
import {
  ArchScene,
  CardMotion,
  ClassicFrame,
  Crest,
  DecoFrame,
  DiamondRule,
  Monogram,
  OliveBranch,
  Rise,
  Sprig,
  Stars,
  TileStrip,
} from "./ornaments";

/**
 * The invitation card. Six designs share one data model and one palette contract
 * (--inv-* custom properties), so any palette works on any design.
 *
 * Everything inside is sized in container-query units (cqw), which makes the same card
 * correct as a 140px thumbnail, a phone-width hero and anything between.
 */

export interface InvitationCardProps {
  wedding: Wedding;
  locale: Locale;
  /** Preview a different design or palette without changing the wedding. */
  templateId?: TemplateId;
  palette?: Palette;
  /** Play the entrance animation on mount. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Square corners and no shadow, for use inside the envelope. */
  flat?: boolean;
}

const cq = (value: number): CSSProperties => ({ fontSize: `${value}cqw` });

/** Small caps line. Hebrew has no capitals, so it gets size and weight instead of tracking. */
const CAPS = "uppercase tracking-[0.32em] he:tracking-[0.04em]";

function Ampersand({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn("italic", className)}
      style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, ...style }}
    >
      &amp;
    </span>
  );
}

function Times({ d, className, separator = "·" }: { d: CardData; className?: string; separator?: string }) {
  return (
    <p className={className}>
      <span>
        {d.labels.reception} <bdi className="tabular">{d.receptionTime}</bdi>
      </span>
      <span aria-hidden className="mx-[1.6cqw] opacity-50">
        {separator}
      </span>
      <span>
        {d.labels.ceremony} <bdi className="tabular">{d.ceremonyTime}</bdi>
      </span>
    </p>
  );
}

/* ───────────────────────── 1 · Classic Luxury ───────────────────────── */

function Classic({ d }: { d: CardData }) {
  const nameSize = fitSize(12.6, 10, d.nameLength);
  return (
    <>
      <ClassicFrame />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[12cqw] py-[11cqw] text-center">
        <Rise i={0}>
          <Monogram a={d.initialA} b={d.initialB} className="w-[13.5cqw] text-[5.2cqw] he:text-[4.6cqw]" />
        </Rise>
        <Rise i={1} className="mt-[5cqw]">
          <p className={cn(CAPS, "text-[color:var(--inv-accent-text)] he:font-medium")} style={cq(d.locale === "he" ? 3.15 : 2.35)}>
            {d.opening}
          </p>
        </Rise>
        <Rise i={2} className="mt-[4cqw]">
          <h2 className="font-serif font-normal leading-[0.98] he:leading-[1.12]" style={cq(nameSize)}>
            <span className="block">{d.bride}</span>
            <Ampersand className="my-[0.06em] block text-[0.52em] leading-none text-[color:var(--inv-accent)]" />
            <span className="block">{d.groom}</span>
          </h2>
        </Rise>
        <Rise i={3} className="mt-[4.2cqw]">
          <p className="font-serif italic leading-snug he:not-italic" style={cq(d.locale === "he" ? 3.9 : 4.3)}>
            {d.invitation}
          </p>
        </Rise>
        <Rise i={4} className="mt-[4.4cqw]">
          <DiamondRule />
        </Rise>
        <Rise i={5} className="mt-[4.4cqw]">
          <p className={cn(CAPS, "font-medium")} style={cq(d.locale === "he" ? 3.5 : 2.8)}>
            {d.weekday}
            <span aria-hidden className="mx-[1.4cqw] text-[color:var(--inv-accent)]">
              ·
            </span>
            {d.dateMedium}
          </p>
          {d.hebrewDate ? (
            <p className="mt-[1cqw] text-[color:var(--inv-muted)]" style={cq(2.9)}>
              {d.hebrewDate}
            </p>
          ) : null}
          <Times d={d} className="mt-[1.6cqw] text-[color:var(--inv-muted)]" />
        </Rise>
        <Rise i={6} className="mt-[4cqw]">
          <p className="font-serif leading-tight" style={cq(d.locale === "he" ? 5 : 5.6)}>
            {d.venue}
          </p>
          {d.address ? (
            <p className="mt-[0.9cqw] text-[color:var(--inv-muted)]" style={cq(2.5)}>
              {d.address}
            </p>
          ) : null}
        </Rise>
        {d.closing ? (
          <Rise i={7} className="mt-[3.6cqw]">
            <p className="font-serif italic text-[color:var(--inv-accent-text)] he:not-italic" style={cq(3.3)}>
              {d.closing}
            </p>
          </Rise>
        ) : null}
      </div>
    </>
  );
}

/* ───────────────────────── 2 · Modern Minimal ───────────────────────── */

function Minimal({ d }: { d: CardData }) {
  const animated = useContext(CardMotion);
  const nameSize = fitSize(9.6, 8.5, d.nameLength + 2);
  return (
    <div className="absolute inset-0 flex flex-col px-[9cqw] py-[9cqw] text-start font-sans">
      <Rise i={0} className={cn("flex items-center justify-between font-medium", CAPS)} style={cq(2.2)}>
        <span dir="ltr">
          {d.initialA}
          <span className="mx-[0.5em] font-light opacity-40">/</span>
          {d.initialB}
        </span>
        <span className="tabular">{d.year}</span>
      </Rise>

      <Rise i={1} className="mt-[7cqw] flex items-end gap-[3.4cqw]">
        <span
          dir="ltr"
          className="tabular font-extralight leading-[0.76] tracking-[-0.07em]"
          style={{ fontSize: "42cqw", fontFamily: '"Inter Variable", "Heebo Variable", sans-serif' }}
        >
          {d.day}
        </span>
        <span className={cn("pb-[1.4cqw] leading-[1.7]", CAPS)} style={cq(d.locale === "he" ? 3.6 : 2.9)}>
          <span className="block font-medium">{d.month}</span>
          <span className="block text-[color:var(--inv-muted)]">{d.weekday}</span>
        </span>
      </Rise>

      <motion.div
        aria-hidden
        className="mt-[6.5cqw] h-px bg-[color:var(--inv-ink)]"
        style={{ transformOrigin: d.locale === "he" ? "right" : "left" }}
        initial={animated ? { scaleX: 0 } : false}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <Rise i={3} className="mt-[6cqw]">
        <h2 className="font-light uppercase leading-[1.08] tracking-[0.1em] he:font-normal he:tracking-normal" style={cq(nameSize)}>
          <span className="block">{d.bride}</span>
          <span className="block">
            <span className="text-[color:var(--inv-muted)]">&amp;</span> {d.groom}
          </span>
        </h2>
      </Rise>

      <Rise i={4} className="mt-[4.4cqw]">
        <p className="max-w-[64cqw] leading-[1.6] text-[color:var(--inv-muted)]" style={cq(d.locale === "he" ? 3.2 : 2.9)}>
          {d.opening}
          {d.opening && d.invitation ? " " : ""}
          {d.invitation}
        </p>
      </Rise>

      <Rise i={5} className="mt-auto grid grid-cols-2 gap-[6cqw] leading-[1.65]" style={cq(d.locale === "he" ? 2.9 : 2.5)}>
        <div>
          <p className={cn("mb-[1cqw] font-medium text-[color:var(--inv-muted)]", CAPS)} style={cq(2)}>
            {d.labels.when}
          </p>
          <p>{d.dateMedium}</p>
          {d.hebrewDate ? <p className="text-[color:var(--inv-muted)]">{d.hebrewDate}</p> : null}
          <p>
            {d.labels.reception} <bdi className="tabular">{d.receptionTime}</bdi>
          </p>
          <p>
            {d.labels.ceremony} <bdi className="tabular">{d.ceremonyTime}</bdi>
          </p>
        </div>
        <div>
          <p className={cn("mb-[1cqw] font-medium text-[color:var(--inv-muted)]", CAPS)} style={cq(2)}>
            {d.labels.where}
          </p>
          <p className="font-medium">{d.venue}</p>
          {d.address ? <p className="text-[color:var(--inv-muted)]">{d.address}</p> : null}
          {d.closing ? <p className="mt-[1.4cqw] text-[color:var(--inv-muted)]">{d.closing}</p> : null}
        </div>
      </Rise>
    </div>
  );
}

/* ───────────────────────── 3 · Romantic Garden ───────────────────────── */

function Garden({ d }: { d: CardData }) {
  const nameSize = fitSize(13.4, 9, d.nameLength);
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-[8cqw] bottom-[7cqw] top-[7cqw] rounded-t-[50cqw] border border-[color:var(--inv-accent)] opacity-35"
      />
      <Sprig className="absolute -end-[5cqw] -top-[4cqw] w-[46cqw] rtl:-scale-x-100" style={{ transform: "rotate(96deg)" }} delay={0.2} />
      <Sprig className="absolute -bottom-[5cqw] -start-[6cqw] w-[44cqw] rtl:-scale-x-100" style={{ transform: "rotate(-8deg)" }} delay={0.7} />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-[14cqw] pb-[10cqw] pt-[17cqw] text-center">
        <Rise i={0}>
          <p className={cn(CAPS, "text-[color:var(--inv-accent-text)] he:font-medium")} style={cq(d.locale === "he" ? 3.1 : 2.3)}>
            {d.opening}
          </p>
        </Rise>
        <Rise i={1} className="mt-[4.5cqw]">
          <h2 className="font-serif font-normal italic leading-[0.94] he:not-italic he:leading-[1.1]" style={cq(nameSize)}>
            <span className="block">{d.bride}</span>
            <Ampersand className="my-[0.02em] block text-[0.5em] leading-[1.1] text-[color:var(--inv-accent)]" />
            <span className="block">{d.groom}</span>
          </h2>
        </Rise>
        <Rise i={2} className="mt-[4.2cqw]">
          <p className="font-serif leading-snug" style={cq(d.locale === "he" ? 3.8 : 4.1)}>
            {d.invitation}
          </p>
        </Rise>
        <Rise i={3} className="mt-[3.6cqw] flex items-center gap-[1.6cqw]" style={cq(2)}>
          <span className="size-[1cqw] rounded-full bg-[color:var(--inv-accent2)]" />
          <span className="size-[1.5cqw] rounded-full bg-[color:var(--inv-accent)] opacity-70" />
          <span className="size-[1cqw] rounded-full bg-[color:var(--inv-accent2)]" />
        </Rise>
        <Rise i={4} className="mt-[3.6cqw]">
          <p className="font-serif leading-tight" style={cq(d.locale === "he" ? 5 : 5.6)}>
            {d.dateMedium}
          </p>
          <p className={cn("mt-[1.2cqw] text-[color:var(--inv-muted)]", CAPS)} style={cq(d.locale === "he" ? 3 : 2.3)}>
            {d.weekday}
            {d.hebrewDate ? ` · ${d.hebrewDate}` : ""}
          </p>
          <Times d={d} className="mt-[1.4cqw] text-[color:var(--inv-muted)]" />
        </Rise>
        <Rise i={5} className="mt-[3.6cqw]">
          <p className="font-serif italic leading-tight he:not-italic" style={cq(d.locale === "he" ? 4.6 : 5)}>
            {d.venue}
          </p>
          {d.address ? (
            <p className="mt-[0.8cqw] text-[color:var(--inv-muted)]" style={cq(2.4)}>
              {d.address}
            </p>
          ) : null}
        </Rise>
        {d.closing ? (
          <Rise i={6} className="mt-[3cqw]">
            <p className="font-serif italic text-[color:var(--inv-accent-text)] he:not-italic" style={cq(3.1)}>
              {d.closing}
            </p>
          </Rise>
        ) : null}
      </div>
    </>
  );
}

/* ───────────────────────── 4 · Mediterranean ───────────────────────── */

function Mediterranean({ d }: { d: CardData }) {
  const nameSize = fitSize(9.4, 15, d.nameLength * 2 + 3);
  return (
    <>
      <div className="absolute inset-0 flex flex-col items-center px-[10cqw] pb-[12cqw] pt-[8cqw] text-center">
        <Rise i={0}>
          <ArchScene className="w-[36cqw]" />
        </Rise>
        <Rise i={1} className="mt-[2.6cqw]">
          <OliveBranch className="mx-auto w-[34cqw]" delay={0.6} />
        </Rise>
        <Rise i={2} className="mt-[2.6cqw]">
          <p className={cn(CAPS, "text-[color:var(--inv-accent-text)] he:font-medium")} style={cq(d.locale === "he" ? 3 : 2.2)}>
            {d.opening}
          </p>
        </Rise>
        <Rise i={3} className="mt-[2.8cqw]">
          <h2
            className="font-serif font-medium uppercase leading-[1.05] tracking-[0.08em] text-[color:var(--inv-ink)] he:tracking-normal"
            style={cq(nameSize)}
          >
            {d.bride} <Ampersand className="text-[color:var(--inv-accent2)]" /> {d.groom}
          </h2>
        </Rise>
        <Rise i={4} className="mt-[2.4cqw]">
          <p className="font-serif italic leading-snug he:not-italic" style={cq(d.locale === "he" ? 3.6 : 3.9)}>
            {d.invitation}
          </p>
        </Rise>
        <Rise i={5} className="mt-[3cqw]">
          <p className={cn(CAPS, "font-medium text-[color:var(--inv-accent-text)]")} style={cq(d.locale === "he" ? 3.3 : 2.6)}>
            {d.weekday}
            <span aria-hidden className="mx-[1.4cqw] text-[color:var(--inv-accent2)]">
              ✦
            </span>
            {d.dateMedium}
          </p>
          {d.hebrewDate ? (
            <p className="mt-[0.8cqw] text-[color:var(--inv-muted)]" style={cq(2.7)}>
              {d.hebrewDate}
            </p>
          ) : null}
          <Times d={d} className="mt-[1.2cqw] text-[color:var(--inv-muted)]" />
        </Rise>
        <Rise i={6} className="mt-[2.6cqw]">
          <p className="font-serif leading-tight" style={cq(d.locale === "he" ? 4.4 : 4.8)}>
            {d.venue}
          </p>
          {d.address ? (
            <p className="mt-[0.6cqw] text-[color:var(--inv-muted)]" style={cq(2.3)}>
              {d.address}
            </p>
          ) : null}
        </Rise>
      </div>
      <TileStrip className="absolute inset-x-0 bottom-0 h-[7cqw]" />
    </>
  );
}

/* ───────────────────────── 5 · Royal Gold ───────────────────────── */

function Royal({ d }: { d: CardData }) {
  const nameSize = fitSize(11.4, 8, d.nameLength);
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 50% 0%, color-mix(in srgb, var(--inv-accent) 20%, transparent), transparent 70%), radial-gradient(120% 70% at 50% 115%, color-mix(in srgb, var(--inv-accent) 12%, transparent), transparent 70%)",
        }}
      />
      <DecoFrame />
      <Stars />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[13cqw] py-[14cqw] text-center">
        <Rise i={0}>
          <Crest a={d.initialA} b={d.initialB} className="w-[15cqw] text-[4.6cqw] he:text-[4cqw]" />
        </Rise>
        <Rise i={1} className="mt-[3.8cqw]">
          <p className={cn(CAPS, "text-[color:var(--inv-accent)] he:font-medium")} style={cq(d.locale === "he" ? 3.1 : 2.3)}>
            {d.opening}
          </p>
        </Rise>
        <Rise i={2} className="mt-[3.8cqw]">
          <h2
            className="font-serif font-medium uppercase leading-[1.02] tracking-[0.07em] he:leading-[1.14] he:tracking-normal"
            style={cq(nameSize)}
          >
            <span className="foil block">{d.bride}</span>
            <Ampersand className="my-[0.08em] block text-[0.46em] leading-none text-[color:var(--inv-accent)] opacity-90" />
            <span className="foil block">{d.groom}</span>
          </h2>
        </Rise>
        <Rise i={3} className="mt-[3.8cqw]">
          <p className="font-serif italic leading-snug he:not-italic" style={cq(d.locale === "he" ? 3.8 : 4.2)}>
            {d.invitation}
          </p>
        </Rise>
        <Rise i={4} className="mt-[3.8cqw]">
          <DiamondRule />
        </Rise>
        <Rise i={5} className="mt-[3.8cqw]">
          <p className={cn(CAPS, "font-medium")} style={cq(d.locale === "he" ? 3.4 : 2.7)}>
            {d.weekday}
            <span aria-hidden className="mx-[1.4cqw] text-[color:var(--inv-accent)]">
              ◆
            </span>
            {d.dateMedium}
          </p>
          {d.hebrewDate ? (
            <p className="mt-[1cqw] text-[color:var(--inv-muted)]" style={cq(2.8)}>
              {d.hebrewDate}
            </p>
          ) : null}
          <Times d={d} className="mt-[1.5cqw] text-[color:var(--inv-muted)]" separator="◆" />
        </Rise>
        <Rise i={6} className="mt-[3.6cqw]">
          <p className="foil font-serif leading-tight" style={cq(d.locale === "he" ? 5 : 5.6)}>
            {d.venue}
          </p>
          {d.address ? (
            <p className="mt-[0.9cqw] text-[color:var(--inv-muted)]" style={cq(2.4)}>
              {d.address}
            </p>
          ) : null}
        </Rise>
        {d.closing ? (
          <Rise i={7} className="mt-[3.2cqw]">
            <p className="font-serif italic text-[color:var(--inv-accent)] he:not-italic" style={cq(3.1)}>
              {d.closing}
            </p>
          </Rise>
        ) : null}
      </div>
    </>
  );
}

/* ───────────────────────── 6 · Editorial Black & White ───────────────────────── */

function Editorial({ d }: { d: CardData }) {
  const animated = useContext(CardMotion);
  const nameSize = fitSize(22, 5.4, d.nameLength + 0.6);
  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {d.photo ? (
          <motion.img
            src={d.photo}
            alt=""
            className="size-full object-cover grayscale"
            style={{ filter: "grayscale(1) contrast(1.12)" }}
            initial={animated ? { scale: 1.14, opacity: 0 } : false}
            animate={{ scale: 1.02, opacity: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div
            className="size-full"
            style={{
              background:
                "radial-gradient(58% 42% at 62% 34%, color-mix(in srgb, var(--inv-ink) 34%, var(--inv-bg)), var(--inv-bg) 72%)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--inv-bg) 72%, transparent) 0%, transparent 26%, transparent 42%, color-mix(in srgb, var(--inv-bg) 88%, transparent) 78%, var(--inv-bg) 100%)",
          }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col px-[6.5cqw] py-[6.5cqw] text-start">
        <Rise i={0} className={cn("flex items-center justify-between font-medium", CAPS)} style={cq(d.locale === "he" ? 2.7 : 2)}>
          <span>{d.labels.issue}</span>
          <span dir="ltr" className="tabular">
            Nº {d.dateNumeric || "—"}
          </span>
        </Rise>
        <motion.div
          aria-hidden
          className="mt-[2.2cqw] h-px bg-[color:var(--inv-ink)]"
          style={{ transformOrigin: d.locale === "he" ? "right" : "left" }}
          initial={animated ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <Rise i={1} className="mt-[2.4cqw] max-w-[58cqw]">
          <p className="font-serif italic leading-snug he:not-italic" style={cq(d.locale === "he" ? 3.4 : 3.6)}>
            {d.opening}
            {d.opening && d.invitation ? " " : ""}
            {d.invitation}
          </p>
        </Rise>

        <Rise i={2} className="mt-auto">
          <h2
            className="font-serif font-semibold uppercase leading-[0.84] tracking-[-0.035em] he:font-medium he:leading-[1.02] he:tracking-normal"
            style={cq(nameSize)}
          >
            <span className="block">{d.bride}</span>
            <span className="block">
              <Ampersand className="me-[0.06em] text-[0.72em] text-[color:var(--inv-accent)]" style={{ fontWeight: 300 }} />
              {d.groom}
            </span>
          </h2>
        </Rise>

        <Rise i={3} className="mt-[4cqw]">
          <div className="h-px bg-[color:var(--inv-ink)] opacity-40" />
          <div className="mt-[2.6cqw] grid grid-cols-3 gap-[3.4cqw] leading-[1.55]" style={cq(d.locale === "he" ? 2.6 : 2.2)}>
            <div>
              <p className={cn("mb-[0.7cqw] font-semibold", CAPS)} style={cq(1.8)}>
                {d.labels.when}
              </p>
              <p>{d.weekday}</p>
              <p>{d.dateMedium}</p>
              {d.hebrewDate ? <p className="text-[color:var(--inv-muted)]">{d.hebrewDate}</p> : null}
            </div>
            <div>
              <p className={cn("mb-[0.7cqw] font-semibold", CAPS)} style={cq(1.8)}>
                {d.labels.reception} · {d.labels.ceremony}
              </p>
              <p dir="ltr" className="tabular text-start">
                {d.receptionTime} · {d.ceremonyTime}
              </p>
              {d.closing ? <p className="text-[color:var(--inv-muted)]">{d.closing}</p> : null}
            </div>
            <div>
              <p className={cn("mb-[0.7cqw] font-semibold", CAPS)} style={cq(1.8)}>
                {d.labels.where}
              </p>
              <p>{d.venue}</p>
              {d.address ? <p className="text-[color:var(--inv-muted)]">{d.address}</p> : null}
            </div>
          </div>
        </Rise>
      </div>
    </>
  );
}

const DESIGNS: Record<TemplateId, (props: { d: CardData }) => React.ReactNode> = {
  classic: Classic,
  minimal: Minimal,
  garden: Garden,
  mediterranean: Mediterranean,
  royal: Royal,
  editorial: Editorial,
};

export function InvitationCard({
  wedding,
  locale,
  templateId,
  palette,
  animated = false,
  className,
  style,
  flat,
}: InvitationCardProps) {
  const template = getTemplate(templateId ?? wedding.templateId);
  const activePalette = palette ?? wedding.palette ?? template.palettes[0];
  const data = useMemo(() => buildCardData(wedding, locale), [wedding, locale]);
  const vars = useMemo(() => paletteVars(activePalette), [activePalette]);
  const Design = DESIGNS[template.id];

  return (
    <div
      className={cn("inv-card relative aspect-[5/7] w-full select-none", className)}
      style={{ containerType: "inline-size", ...style }}
    >
      {/* The inner surface is sized in cqw, so it has to sit inside the container, not be it. */}
      <div
        lang={locale}
        dir={locale === "he" ? "rtl" : "ltr"}
        data-template={template.id}
        className={cn("paper absolute inset-0 overflow-hidden", flat ? "" : "rounded-[1.4cqw] shadow-paper")}
        style={{ ...vars, background: "var(--inv-bg)", color: "var(--inv-ink)", fontSize: "2.7cqw" } as CSSProperties}
      >
        <CardMotion.Provider value={animated}>
          <Design d={data} />
        </CardMotion.Provider>
      </div>
    </div>
  );
}
