// Dev-only type specimen (Roadmap P4 acceptance: "type specimen page matches
// the Figma Type Styles sheet at 1440/390"). Not in the route registry —
// tooling. Prerenders as 404 in production builds.

import { notFound } from "next/navigation";
import { formatDuration, formatPrice, frPunctuation } from "@/lib/utils/format";

const roles = [
  { cls: "text-display", name: "serif/display 64/40 · 1.08" },
  { cls: "text-h2", name: "serif/h2 40/30 · 1.15" },
  { cls: "text-h3", name: "serif/h3 26/22 · 1.25" },
  { cls: "text-quote", name: "serif/quote 26/22 · 1.45" },
  { cls: "text-body-letter", name: "serif/body-letter 19/18 · 1.6" },
  { cls: "text-caption", name: "serif/caption 15/14 · 1.4" },
  { cls: "text-body", name: "sans/body 17/16 · 1.55" },
  { cls: "text-small", name: "sans/small 14/13 · 1.5" },
  { cls: "text-kicker", name: "sans/kicker 13/12 · +12% · CAPS" },
  { cls: "text-nav", name: "sans/nav 16 · dt only" },
  { cls: "text-price", name: "sans/price 24/22 · 500 · tabular" },
  { cls: "text-button", name: "sans/button 15 · 500" },
  { cls: "text-label", name: "sans/label 14 · 500" },
] as const;

export default function TypeSpecimen() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main" className="p-8 max-w-measure">
      <h1 className="text-h2">Type — Foundations v1.0.0</h1>

      {roles.map(({ cls, name }) => (
        <section key={cls} className="mt-8">
          <p className="text-small text-ink-secondary">{name}</p>
          <p className={cls}>Des photos qui vous ressemblent.</p>
        </section>
      ))}

      <section className="mt-8">
        <p className="text-small text-ink-secondary">
          serif italic — the aside register (character override, ≤2/page)
        </p>
        <p className="text-body-letter italic">
          ici, j&apos;ai posé l&apos;appareil et nous avons pris un thé
        </p>
      </section>

      <section className="mt-8">
        <p className="text-small text-ink-secondary">
          cyrillic (Inter subset — review names must never fall back)
        </p>
        <p className="text-label">АЛЁНА КИСЛИЦА</p>
        <p className="text-small">Ирина сняла нашу свадьбу — от сборов до ужина.</p>
      </section>

      <section className="mt-8">
        <p className="text-small text-ink-secondary">
          FAQ question register — text-body + font-medium (the one legal
          weight override)
        </p>
        <p className="text-body font-medium">
          Et si on n&apos;est pas à l&apos;aise devant l&apos;objectif&nbsp;?
        </p>
      </section>

      <section className="mt-8">
        <p className="text-small text-ink-secondary">French helpers</p>
        <p className="text-price">{formatPrice(290, "fr")}</p>
        <p className="text-price">{formatPrice(1250, "fr")}</p>
        <p className="text-body">{formatPrice(290, "en")} (en)</p>
        <p className="text-body">{formatDuration(1, 30)} · {formatDuration(2)}</p>
        <p className="text-body">{frPunctuation("Une autre question ? Écrivez-moi !")}</p>
        <p className="text-body">{frPunctuation("« La confiance, avant tout »")}</p>
      </section>
    </main>
  );
}
