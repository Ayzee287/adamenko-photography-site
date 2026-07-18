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
import { getDictionary } from "@/lib/dictionary";
import { SkipLink } from "@/components/chrome/skip-link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { notFound } from "next/navigation";
import "@/styles/tokens.css";

// Séances is gated on ≥3 published stories (frozen nav law). The stories
// collection arrives in P15 — until then the gate is closed by constant.
const showSeances = false;

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
  const active = locale as Locale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  return (
    <html lang={htmlLang[active]} className={fontVariables}>
      <body className="flex min-h-dvh flex-col text-body">
        <SkipLink />
        <Header
          locale={active}
          tone="paper"
          showSeances={showSeances}
          chrome={{
            brand: dict.site.brand,
            primary: dict.ui.nav.primary,
            language: dict.ui.nav.language,
            menu: dict.ui.nav.menu,
            openMenu: dict.ui.nav.openMenu,
            closeMenu: dict.ui.nav.closeMenu,
            contactCta: dict.copy.home.contactCta,
            instagram: dict.ui.nav.instagram,
            facebook: dict.ui.nav.facebook,
          }}
          socials={dict.site.social}
        />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer showSeances={showSeances} />
        {/* analytics slot (P20) */}
      </body>
    </html>
  );
}
