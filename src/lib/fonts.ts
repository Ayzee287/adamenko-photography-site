// The frozen "V1 production families" (Addendum C1): Fraunces + Inter, config
// carried over from V1's layout verbatim.
//
// Fraunces — the serif voice. Weight 400 is the ONLY weight the system renders
// (bold serif does not exist — VLS §3); the italic face is real, not synthetic,
// because serif italic is the sanctioned aside register (≤2 passages/page).
//
// Inter — the sans voice. Variable font; the role classes use 400/500 only
// (the sole weight utility is font-medium). Cyrillic subset is load-bearing:
// Google-review author names (e.g. АЛЁНА КИСЛИЦА) render in the visitor-facing
// sans and must never fall back to a system face.

import { Fraunces, Inter } from "next/font/google";

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/** Class string for the root <html> element — makes both font variables
 *  available to the token layer (`--font-serif`/`--font-sans` in tokens). */
export const fontVariables = `${fraunces.variable} ${inter.variable}`;
