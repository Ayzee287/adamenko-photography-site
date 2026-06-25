import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import type { LegalDocument } from "@/content/legal";

/**
 * Shared renderer for the legal pages. Brought fully onto the inner-page system
 * (Design Sprint V2 · D039): the same `PageHeader` primitive, `Reveal`, and opening
 * rhythm as /a-propos, /galeries, /prestations and /contact — so a visitor who lands
 * on the legal pages still feels the one authored product, not a plainer sub-site.
 * Reading measure is constrained for long-form text; sub-headings are serif; lists
 * carry the brand's clay-rule motif.
 */
export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={doc.eyebrow} title={doc.title} intro={doc.intro} />
        <p className="mt-3 text-xs text-muted">{doc.updated}</p>
      </Reveal>

      <Reveal variant="rise-slow" className="block">
        <div className="mt-10 max-w-3xl space-y-10 sm:mt-16">
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
      </Reveal>
    </Container>
  );
}
