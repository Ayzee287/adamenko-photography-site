import type { Metadata } from "next";
import { notFound } from "next/navigation";

// V1-mined catch-all: any unmatched path under a locale (e.g. /en/typo, /foo
// via the FR rewrite) triggers the localised, chrome'd 404
// (app/[locale]/not-found.tsx) instead of the framework's bare default.
// Served on demand (any path), then 404s.
//
// TITLE CORRECTION vs V1: V1 put the "404" title on not-found.tsx and its
// comment claimed the catch-all's metadata is ignored — but the LIVE V1
// production 404 shows the default title (observed in the 2026-07-18 audit),
// i.e. that mechanism regressed. Under Next 16.2 the streamed head carries
// the MATCHED route's metadata (layout + this catch-all), resolved before the
// render throws — so the title lives HERE. Locale-neutral "404" by the same
// reasoning V1 documented (the layout template brands it).
export const dynamicParams = true;

export const metadata: Metadata = { title: "404" };

export default async function NotFoundCatchAll() {
  notFound();
}
