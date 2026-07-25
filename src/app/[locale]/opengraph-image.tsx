// Per-locale OpenGraph social card (file convention). Photo-backed hero + wordmark,
// generated offline at build via the shared renderer; inherited by every page.

import { renderOgImage, ogSize, ogContentType, ogAlt } from "@/lib/og";
import { isLocale, defaultLocale } from "@/lib/i18n";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = ogAlt;

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderOgImage(isLocale(locale) ? locale : defaultLocale);
}
