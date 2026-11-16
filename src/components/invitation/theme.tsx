import type { CSSProperties } from "react";
import { FONT_PAIRING_MAP } from "@/lib/invitation/fonts";
import type { InvitationDesign } from "@/lib/invitation/schema";

export const SPACING_SCALE = { compact: 0.75, balanced: 1, airy: 1.3 } as const;

/** CSS custom properties that every invitation section reads from. */
export function themeVars(design: InvitationDesign): CSSProperties {
  const pairing = FONT_PAIRING_MAP[design.typography.pairing];
  const { colors, typography } = design;
  return {
    "--inv-bg": colors.background,
    "--inv-surface": colors.surface,
    "--inv-text": colors.text,
    "--inv-text-2": colors.textSecondary,
    "--inv-accent": colors.accent,
    "--inv-button": colors.button,
    "--inv-button-text": colors.buttonText,
    "--inv-display": pairing.display,
    "--inv-body": pairing.body,
    "--inv-scale": String(typography.scale),
    "--inv-weight": String(typography.headingWeight),
    "--inv-leading": String(typography.lineHeight),
    "--inv-tracking": `${typography.letterSpacing}em`,
    "--inv-space": String(SPACING_SCALE[design.layout.spacing]),
    "--inv-name-style": typography.nameStyle === "italic" || pairing.displayItalic ? "italic" : "normal",
    "--inv-name-transform": pairing.uppercaseNames ? "uppercase" : "none",
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: pairing.body,
    lineHeight: typography.lineHeight,
    containerType: "inline-size",
  } as CSSProperties;
}

export function backgroundStyle(design: InvitationDesign): CSSProperties {
  const bg = design.background;
  if (bg.kind === "gradient") {
    return { backgroundImage: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` };
  }
  return { backgroundColor: design.colors.background };
}
