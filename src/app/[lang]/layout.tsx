import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteUrl, allowIndexing } from "@/lib/site";
import { site } from "@/content/site";
import { headlineFor } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/structured-data";
import {
  activeLocales,
  defaultLocale,
  htmlLang,
  ogLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import "@/styles/globals.css";

// Display — a warm humanist serif (vault design-language). Fraunces reads soft and
// friendly, not a high-contrast fashion serif. Weight 400 is the only weight ever
// rendered (no font-medium/font-semibold utility exists in this codebase), so 500/600
// were dead font files; italic is added because font-serif italic is already used
// (e.g. the /prestations service taglines) and without a loaded italic face the
// browser was faking it via synthetic oblique on the roman glyphs.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body — clean humanist sans.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// The localised root layout. French is served at "/" via a middleware rewrite to
// "/fr"; English at "/en". Only active locales are pre-rendered (the rest 404), so
// hreflang never advertises a route that doesn't exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return activeLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = getDictionary(locale);
  return {
    metadataBase: siteUrl,
    title: {
      default: headlineFor(locale),
      template: `%s · ${site.brand}`,
    },
    description: dict.site.tagline,
    // Belt-and-braces with robots.ts: non-production deploys also carry a meta
    // noindex so a preview URL is never indexed even if robots.txt is bypassed (SEO5).
    robots: allowIndexing ? undefined : { index: false, follow: false },
    openGraph: {
      siteName: site.brand,
      locale: ogLocale[locale],
      type: "website",
    },
  };
}

// Tints the mobile browser chrome to the site's paper surface (N5).
export const viewport: Viewport = {
  themeColor: "#faf6f0",
};

export default async function LangLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang) || !activeLocales.includes(lang)) notFound();
  const locale: Locale = lang;
  // Make the locale available to every server component in this request without
  // threading it as a prop (request-scoped; see lib/request-locale).
  setRequestLocale(locale);

  const dict = getDictionary(locale);
  // Resolved string slices passed to the CLIENT chrome as props — keeps the content
  // graph out of the client bundle (the components never import getDictionary).
  const chrome = {
    brand: site.brand,
    instagramHref: site.social.instagram,
    facebookHref: site.social.facebook,
    nav: dict.site.nav,
    ui: dict.ui,
    contactCta: dict.copy.home.contactCta,
  };

  return (
    <html
      lang={htmlLang[locale]}
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        {/* Skip link — first focusable, visually hidden until focused (N1). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-ink/35 focus:bg-paper focus:px-5 focus:py-2 focus:text-sm focus:text-ink"
        >
          {dict.ui.skipToContent}
        </a>
        <JsonLd data={localBusinessJsonLd(locale)} />
        <SiteHeader lang={locale} chrome={chrome} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
