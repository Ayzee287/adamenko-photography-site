import { notFound } from "next/navigation";

// Catch-all for any unmatched path under a locale (e.g. /en/typo, /foo via the rewrite).
// It immediately triggers the localised, chrome'd 404 (app/[lang]/not-found.tsx) instead
// of the framework's bare default page (I3). Served on demand (any path), then 404s.
// The 404's title lives on not-found.tsx — a generateMetadata here is IGNORED once
// the page throws notFound() (verified against next start).
export const dynamicParams = true;

export default async function NotFoundCatchAll() {
  notFound();
}
