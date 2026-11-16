"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { GuestPersonalization, InvitationDesign, WeddingFacts } from "@/lib/invitation/schema";
import { cn } from "@/lib/utils";
import { InvitationCover } from "./cover";
import { themeVars } from "./theme";

/**
 * Renders children at a fixed design size and scales them to the container's
 * width. Used for template cards, phone mockups and editor previews so a real
 * invitation (not a screenshot) is shown at any size.
 */
export function ScaledFrame({
  width = 390,
  height = 844,
  children,
  className,
}: {
  width?: number;
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: `${width} / ${height}` }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})`, opacity: scale ? 1 : 0, transition: "opacity .4s" }}
      >
        {children}
      </div>
    </div>
  );
}

/** A static, real rendering of an invitation's cover. */
export function InvitationThumbnail({
  design,
  facts,
  guest,
  className,
  width = 390,
  height = 844,
}: {
  design: InvitationDesign;
  facts: WeddingFacts;
  guest?: GuestPersonalization | null;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <ScaledFrame width={width} height={height} className={className}>
      <div className="inv-root h-full w-full" style={themeVars(design)} dir={design.language === "he" ? "rtl" : "ltr"} lang={design.language}>
        <InvitationCover design={design} facts={facts} guest={guest} className="h-full" compact />
      </div>
    </ScaledFrame>
  );
}
