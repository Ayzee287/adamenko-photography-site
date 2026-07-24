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

  return (
    <ChambreScene>
      <ChapterOpening kicker={doc.eyebrow} title={doc.title} intro={doc.intro} mark="§ Légal" />
      <LegalDoc doc={doc} />
    </ChambreScene>
  );
}
