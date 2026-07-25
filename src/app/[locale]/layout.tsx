// The root layout (official App-Router i18n pattern, V1-proven: the whole app
// lives under [locale] because the proxy keeps FR unprefixed, so THIS layout
// carries the html/body/root duties — there is deliberately no app/layout.tsx).
//
// Structure only (Roadmap P6): chrome mounts at the marked slots in P7;
// analytics mounts at its slot in P20. The layout owns the single
// <main id="main"> landmark — pages render content, never landmarks.

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { activeLocales, htmlLang, isLocale, type Locale } from "@/lib/i18n";
import { setRequestLocale } from "@/lib/request-locale";
import { buildBaseMetadata } from "@/lib/seo/metadata";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/dictionary";
import { localBusinessJsonLd } from "@/lib/structured-data";
import { Ambient } from "@/components/chambre/ambient";
import { SkipLink } from "@/components/chrome/skip-link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { notFound } from "next/navigation";
import "@/styles/tokens.css";
import "@/styles/chambre.css";

// The whole site renders on the CHAMBRE obsidian surface, so the mobile browser chrome
// is tinted to match (the warm V1 theme-color would flash a pale bar over a dark site).
export const viewport: Viewport = {
  themeColor: "#0a0908",
};

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
        <Ambient />
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
        {/* Analytics (P20) — Vercel Web Analytics + Speed Insights: cookieless, no
            personal identification (declared in the privacy policy), no credentials or
            IDs, and a no-op when not deployed on Vercel, so dev is unaffected. */}
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          // Site-wide LocalBusiness graph (the photographer linked as founder), built
          // from the typed content so it can never drift from the UI.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd(active)),
          }}
        />
      </body>
    </html>
  );
}
