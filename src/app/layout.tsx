import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl, allowIndexing } from "@/lib/site";
import { site, siteHeadline } from "@/content/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/structured-data";
import { defaultLocale, htmlLang, ogLocale } from "@/lib/i18n";
import "@/styles/globals.css";

// Display — a warm humanist serif (vault design-language). Not a high-contrast
// fashion serif; Fraunces reads soft and friendly.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Body — clean humanist sans.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteHeadline,
    template: `%s · ${site.brand}`,
  },
  description: site.tagline,
  // Belt-and-braces with robots.ts: non-production deploys also carry a meta
  // noindex so a preview URL is never indexed even if robots.txt is bypassed (SEO5).
  robots: allowIndexing ? undefined : { index: false, follow: false },
  openGraph: {
    siteName: site.brand,
    locale: ogLocale[defaultLocale],
    type: "website",
  },
};

// Tints the mobile browser chrome to the site's paper surface so the address bar
// blends with the page rather than showing the OS default (N5).
export const viewport: Viewport = {
  themeColor: "#faf6f0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={htmlLang[defaultLocale]}
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        {/* Skip link — the first focusable element, visually hidden until focused.
            Landmarks already satisfy WCAG 2.4.1; this completes the technique for
            sighted keyboard users so they bypass the header on every route (N1). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-ink/35 focus:bg-paper focus:px-5 focus:py-2 focus:text-sm focus:text-ink"
        >
          Aller au contenu
        </a>
        <JsonLd data={localBusinessJsonLd()} />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
