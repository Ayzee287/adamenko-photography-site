import type { Metadata } from "next";
import { activeLocales, htmlLang, isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import "@/styles/tokens.css";

// Phase 0 placeholder shell (V2 rebuild). The V1 tree was removed on this
// branch; real layouts arrive in Phase 6 of the implementation roadmap.
// Mirrors the V1/official i18n pattern: this IS the root layout (no
// app/layout.tsx), so the FR-unprefixed proxy rewrites keep working.

export const dynamicParams = false;

export function generateStaticParams() {
  return activeLocales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Adamenko Photography",
  robots: { index: false },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={htmlLang[locale as Locale]}>
      <body>{children}</body>
    </html>
  );
}
