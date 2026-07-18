import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";
import { link } from "@/lib/routes";

// V1-proven 404 mechanism, carried whole: own the error state's title —
// without this the 404 inherits the layout's DEFAULT title (the homepage
// headline) in the tab and history. Deliberately locale-NEUTRAL: this
// metadata pass runs before the layout render seeds the request-locale cache
// (verified in V1 production — a localised title here came out French on
// /en), and Next hands not-found no params. "404 · <brand>" via the layout's
// title template is honest in both locales.
export const metadata: Metadata = { title: "404" };

// The body DOES localise: the layout has seeded the request locale by body
// render time. Copy = the spec'd 404 (PBS §11): kicker · display sentence ·
// one line · one road home. Centered — the sanctioned exception.
export default function NotFound() {
  const locale = getRequestLocale();
  const t = getDictionary(locale).ui.notFound;
  return (
    <div className="mx-auto max-w-measure px-5 py-12 text-center">
      <p className="text-kicker text-ink-secondary">{t.eyebrow}</p>
      <h1 className="text-display mt-3">{t.title}</h1>
      <p className="text-body mt-4 text-ink-secondary">{t.intro}</p>
      <p className="mt-6">
        <Link href={link(locale, { page: "home" })} className="text-button underline">
          {t.back} →
        </Link>
      </p>
    </div>
  );
}
