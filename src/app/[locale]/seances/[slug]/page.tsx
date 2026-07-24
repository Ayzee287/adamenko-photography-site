// Séance [slug] — individual story pages. No stories exist yet (real-only law), so
// generateStaticParams returns [] and, with dynamicParams=false, ZERO pages build:
// every /seances/<slug> is a 404 (the ∅ law at the routing layer). When a real stories
// collection lands, map it here.

import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

export default function Page() {
  notFound();
}
