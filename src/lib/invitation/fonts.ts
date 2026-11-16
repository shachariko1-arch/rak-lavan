import type { FontPairingId } from "./schema";

/**
 * Approved font pairings, built only from the VOW font library
 * (Cormorant Garamond, Frank Ruhl Libre, Inter, Heebo). Hebrew glyphs fall
 * back to Frank Ruhl Libre / Heebo automatically through the stacks.
 */
export type FontPairing = {
  id: FontPairingId;
  label: { en: string; he: string };
  display: string;
  body: string;
  displayItalic: boolean;
  uppercaseNames: boolean;
};

const CORMORANT = '"Cormorant Garamond", "Frank Ruhl Libre", Georgia, serif';
const FRANK = '"Frank Ruhl Libre", "Cormorant Garamond", Georgia, serif';
const INTER = '"Inter Variable", "Heebo Variable", system-ui, sans-serif';
const HEEBO = '"Heebo Variable", "Inter Variable", system-ui, sans-serif';

export const FONT_PAIRING_MAP: Record<FontPairingId, FontPairing> = {
  editorial: {
    id: "editorial",
    label: { en: "Editorial Serif", he: "סריף מגזיני" },
    display: CORMORANT,
    body: INTER,
    displayItalic: false,
    uppercaseNames: false,
  },
  romantic: {
    id: "romantic",
    label: { en: "Romantic Italic", he: "נטוי רומנטי" },
    display: CORMORANT,
    body: CORMORANT,
    displayItalic: true,
    uppercaseNames: false,
  },
  modern: {
    id: "modern",
    label: { en: "Modern Sans", he: "סאנס מודרני" },
    display: INTER,
    body: INTER,
    displayItalic: false,
    uppercaseNames: true,
  },
  heritage: {
    id: "heritage",
    label: { en: "Heritage", he: "מורשת" },
    display: FRANK,
    body: HEEBO,
    displayItalic: false,
    uppercaseNames: false,
  },
  classic: {
    id: "classic",
    label: { en: "Classic Serif", he: "סריף קלאסי" },
    display: FRANK,
    body: CORMORANT,
    displayItalic: false,
    uppercaseNames: false,
  },
};

export const FONT_PAIRING_LIST = Object.values(FONT_PAIRING_MAP);
