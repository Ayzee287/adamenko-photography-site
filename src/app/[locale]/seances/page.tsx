// Séances (stories) — individual séance narratives. There is no story content yet
// (and none may be fabricated — the real-only law), and the chapter is gated out of the
// navigation (showSeances). Rather than a placeholder, the route folds into the work:
// the séances live inside the galleries until dedicated stories exist. This keeps the
// URL production-valid with no empty page and no fake content.

import { redirect } from "next/navigation";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link } from "@/lib/routes";

export default async function SeancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  redirect(link(active, { page: "galeries" }));
}
