import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { buildMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const doc = getDictionary(locale).legal.mentionsLegales;
  return buildMetadata({
    title: doc.title,
    description: doc.intro,
    path: "/mentions-legales",
    locale,
  });
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  return <LegalDocumentView doc={getDictionary(locale).legal.mentionsLegales} />;
}
