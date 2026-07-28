// Mentions légales (LCEN, art. 6-III). FR-canonical legal content, rendered in CHAMBRE.

import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { mentionsLegales } from "@/content/legal";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { LegalDoc } from "@/components/chambre/legal-doc";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    title: mentionsLegales.title,
    description: mentionsLegales.intro,
    path: "/mentions-legales",
    locale: isLocale(locale) ? locale : defaultLocale,
  });
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const doc = mentionsLegales;
  // The mentions légales are French under French law (LCEN art. 6-III) and are not
  // translated — the operative text is the French one. On /en that means a French document
  // inside a document declared `lang="en"`, which is a claim the markup should not make:
  // it mispronounces the whole page for a screen reader and tells Google the site publishes
  // broken English. Tagging the block is the honest fix; translating the legal text is a
  // decision for the operator and a French legal professional, not for this layer.
  const docLang = active === "fr" ? undefined : "fr";

  return (
    <ChambreScene>
      <ChapterOpening
        kicker={doc.eyebrow}
        title={doc.title}
        intro={doc.intro}
        mark="§ Légal"
        lang={docLang}
      />
      <LegalDoc doc={doc} lang={docLang} />
    </ChambreScene>
  );
}
