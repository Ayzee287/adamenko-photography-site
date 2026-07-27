// /prestations — consolidated into /tarifs (D095). The index duplicated the homepage
// genre plates and the galleries index; /tarifs is now the single "what I offer and what
// it costs" hub. This route permanently redirects there so any inbound link or bookmark
// still lands somewhere sensible; the per-service dossiers at /prestations/[service] live
// on as SEO landing pages and are unaffected.

import { permanentRedirect } from "next/navigation";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { setRequestLocale } from "@/lib/request-locale";
import { link } from "@/lib/routes";

export default async function PrestationsIndexRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  // 308, not 307: this consolidation is permanent, so the redirect must SAY so.
  // `redirect()` emits a temporary 307, which tells a crawler to keep the old URL in
  // the index and re-check it forever — it never transfers the signals of any inbound
  // link to /tarifs. `permanentRedirect()` is the honest status for a merged page.
  permanentRedirect(link(active, { page: "tarifs" }));
}
