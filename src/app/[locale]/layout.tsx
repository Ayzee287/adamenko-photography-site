// The root layout (official App-Router i18n pattern, V1-proven: the whole app
// lives under [locale] because the proxy keeps FR unprefixed, so THIS layout
// carries the html/body/root duties — there is deliberately no app/layout.tsx).
//
// Structure only (Roadmap P6): chrome mounts at the marked slots in P7;
// analytics mounts at its slot in P20. The layout owns the single
// <main id="main"> landmark — pages render content, never landmarks.

import type { Metadata } from "next";
import { activeLocales, htmlLang, isLocale, type Locale } from "@/lib/i18n";
import { setRequestLocale } from "@/lib/request-locale";
import { buildBaseMetadata } from "@/lib/seo/metadata";
import { fontVariables } from "@/lib/fonts";
import { notFound } from "next/navigation";
import "@/styles/tokens.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return activeLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildBaseMetadata(isLocale(locale) ? locale : "fr");
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);
  return (
    <html lang={htmlLang[locale as Locale]} className={fontVariables}>
      <body className="text-body">
        {/* chrome slot: skip-link + header (P7) */}
        <main id="main">{children}</main>
        {/* chrome slot: footer (P7) */}
        {/* analytics slot (P20) */}
      </body>
    </html>
  );
}
