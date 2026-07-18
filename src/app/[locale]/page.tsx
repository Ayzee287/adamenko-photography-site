import type { Locale } from "@/lib/i18n";

// Phase 0 placeholder page. Real pages are assembled from the V2 component
// census starting Phase 12 (Accueil). Copy is deliberately minimal and calm —
// this renders on preview deployments only (branch `v2`; production stays V1).

const copy: Record<string, { line: string }> = {
  fr: { line: "Adamenko Photography — nouvelle version en préparation." },
  en: { line: "Adamenko Photography — a new version is in the making." },
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { line } = copy[locale as Locale] ?? copy.fr;
  return (
    <main id="main">
      <p>{line}</p>
    </main>
  );
}
