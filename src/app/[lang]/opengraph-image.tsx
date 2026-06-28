import { ogAlt, ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { activeLocales, defaultLocale, isLocale } from "@/lib/i18n";

// Per-locale OpenGraph image (inherited by every page in the locale tree). The card
// renders the localised kicker + tagline, so a shared EN link shows English text.
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return activeLocales.map((lang) => ({ lang }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderOgImage(isLocale(lang) ? lang : defaultLocale);
}
