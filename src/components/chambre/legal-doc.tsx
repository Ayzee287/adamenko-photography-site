// legal-doc — renders a LegalDocument's sections as quiet dark prose. Shared by
// mentions-legales and confidentialite so the two legal pages stay one implementation.

import type { LegalDocument } from "@/content/legal";
import { Develop } from "@/components/chambre/develop";

export function LegalDoc({ doc }: { doc: LegalDocument }) {
  return (
    <section className="ch-movement ch-wrap">
      <div style={{ maxWidth: "46rem", display: "flex", flexDirection: "column", gap: "2.6rem" }}>
        {doc.sections.map((s, i) => (
          <Develop key={i}>
            <div>
              <h2 className="text-h3 text-ink" style={{ marginBottom: "0.9rem" }}>
                {s.heading}
              </h2>
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="text-body text-ink-secondary" style={{ marginBottom: "0.6rem" }}>
                  {p}
                </p>
              ))}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="ch-list text-body text-ink-secondary" style={{ marginTop: "1rem" }}>
                  {s.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </Develop>
        ))}
        <p className="ch-mono">{doc.updated}</p>
      </div>
    </section>
  );
}
