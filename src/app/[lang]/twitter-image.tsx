import { ogAlt, ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { activeLocales, defaultLocale, isLocale } from "@/lib/i18n";

// Per-locale Twitter card image — same renderer as OpenGraph (summary_large_image).
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return activeLocales.map((lang) => ({ lang }));
}

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderOgImage(isLocale(lang) ? lang : defaultLocale);
}
