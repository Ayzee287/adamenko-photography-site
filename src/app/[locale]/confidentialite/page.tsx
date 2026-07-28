// Politique de confidentialité (RGPD). FR-canonical legal content, rendered in CHAMBRE.

import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { confidentialite } from "@/content/legal";
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
    title: confidentialite.title,
    description: confidentialite.intro,
    path: "/confidentialite",
    locale: isLocale(locale) ? locale : defaultLocale,
  });
}

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const doc = confidentialite;
  // French-only by the same reasoning as the mentions légales — see that page.
  const docLang = active === "fr" ? undefined : "fr";

  return (
    <ChambreScene>
      <ChapterOpening
        kicker={doc.eyebrow}
        title={doc.title}
        intro={doc.intro}
        mark="§ RGPD"
        lang={docLang}
      />
      <LegalDoc doc={doc} lang={docLang} />
    </ChambreScene>
  );
}
