// Séances (stories) — individual séance narratives. There is no story content yet
// (and none may be fabricated — the real-only law), and the chapter is gated out of the
// navigation (showSeances). Rather than a placeholder, the route folds into the work:
// the séances live inside the galleries until dedicated stories exist. This keeps the
// URL production-valid with no empty page and no fake content.

import { permanentRedirect } from "next/navigation";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link } from "@/lib/routes";

export default async function SeancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  // 308 — the séances chapter folds into the galleries for as long as it is gated out
  // of the navigation, and a temporary 307 would leave the URL sitting in the index
  // competing with /galeries instead of consolidating into it.
  permanentRedirect(link(active, { page: "galeries" }));
}
