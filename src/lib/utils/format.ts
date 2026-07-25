// French typographic helpers (Architecture §18: centralized — never inline
// manual spacing in content strings). The narrow no-break space (U+202F) is
// the French typographic space: before double punctuation, inside guillemets,
// in prices and durations. These helpers are the only place it is typed.

import type { Locale } from "@/lib/i18n";

/** Narrow no-break space — the French typographic space. */
export const NNBSP = " ";

/**
 * Price formatting per the frozen price register:
 *   fr → "290 €", "1 250 €"  (NNBSP grouping, NNBSP before €)
 *   en → "€290", "€1,250"
 * Whole euros only — the offer records carry integer anchors.
 */
export function formatPrice(amount: number, locale: Locale): string {
  if (locale === "fr") {
    const digits = new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    })
      .format(amount)
      // Intl may group with NBSP or NNBSP depending on ICU — normalize to NNBSP.
      .replace(/[  \s]/g, NNBSP);
    return `${digits}${NNBSP}€`;
  }
  return `€${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/**
 * French double-punctuation spacing: NNBSP before ; : ! ? and », after «.
 * Replaces an existing ordinary space or inserts one when missing; never
 * doubles an NNBSP that is already correct.
 */
export function frPunctuation(text: string): string {
  return text
    .replace(/[   ]*([;:!?»])/g, `${NNBSP}$1`)
    .replace(/(«)[   ]*/g, `$1${NNBSP}`)
    // A colon inside a URL or time (12:30) must not gain a space:
    .replace(new RegExp(`(\\d)${NNBSP}:(\\d)`, "g"), "$1:$2")
    .replace(new RegExp(`(https?)${NNBSP}:`, "g"), "$1:");
}

/**
 * Session durations in the practical register: "1 h 30", "2 h" —
 * NNBSP around the "h", minutes omitted when zero.
 */
export function formatDuration(hours: number, minutes = 0): string {
  const h = `${hours}${NNBSP}h`;
  return minutes > 0 ? `${h}${NNBSP}${String(minutes).padStart(2, "0")}` : h;
}
