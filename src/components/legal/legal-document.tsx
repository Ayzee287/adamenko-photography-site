import { Container } from "@/components/layout/container";
import type { LegalDocument } from "@/content/legal";

/**
 * Shared renderer for the legal pages (sprint task 2). Uses the established
 * inner-page rhythm (Container + serif title) and the homepage's eyebrow grammar
 * (`text-xs uppercase tracking-[0.22em] text-muted`) so the pages belong to the
 * system without introducing any new visual language. Reading measure is
 * constrained for long-form text; sub-headings are serif; lists carry the brand's
 * clay rule motif.
 */
export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {doc.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">{doc.title}</h1>
        {doc.intro ? (
          <p className="mt-4 max-w-2xl text-pretty text-muted">{doc.intro}</p>
        ) : null}
        <p className="mt-3 text-xs text-muted">{doc.updated}</p>

        <div className="mt-12 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl text-ink">{section.heading}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mt-3 text-pretty text-muted">
                  {p}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-2.5 text-muted">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2.5 h-px w-3 shrink-0 bg-clay"
                      />
                      <span className="text-pretty">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
