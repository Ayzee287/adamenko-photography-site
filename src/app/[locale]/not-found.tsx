import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";
import { link } from "@/lib/routes";
import { ChambreScene } from "@/components/chambre/scene";

// V1-proven 404 mechanism, carried whole: own the error state's title — without this
// the 404 inherits the layout's DEFAULT title. Deliberately locale-NEUTRAL ("404 ·
// <brand>" via the title template is honest in both locales).
export const metadata: Metadata = { title: "404" };

// The body DOES localise (the layout seeds the request locale by body render time).
// Centered — the one sanctioned exception — now developed from the CHAMBRE dark.
export default function NotFound() {
  const locale = getRequestLocale();
  const t = getDictionary(locale).ui.notFound;
  return (
    <ChambreScene>
      <section className="ch-movement ch-wrap ch-chapter" style={{ textAlign: "center" }}>
        <p className="ch-mono ch-kicker" style={{ justifyContent: "center" }}>
          <span className="n">404</span> {t.eyebrow}
        </p>
        <h1 className="ch-display ch-chapter-title" style={{ margin: "1.2rem auto 0", maxWidth: "18ch" }}>
          {t.title}
        </h1>
        <p className="ch-lead" style={{ margin: "1.6rem auto 0" }}>
          {t.intro}
        </p>
        <div style={{ marginTop: "2.4rem" }}>
          <Link className="ch-go" href={link(locale, { page: "home" })} style={{ justifyContent: "center" }}>
            {t.back} <span className="ch-arrow" aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </ChambreScene>
  );
}
