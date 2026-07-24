// Per-locale Twitter card (file convention) — the same photo-backed card as OpenGraph.

import { renderOgImage, ogSize, ogContentType, ogAlt } from "@/lib/og";
import { isLocale, defaultLocale } from "@/lib/i18n";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = ogAlt;

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderOgImage(isLocale(locale) ? locale : defaultLocale);
}
