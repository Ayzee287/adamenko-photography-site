import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact-form";
import { copy, site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.contact.title,
  description: copy.contact.intro,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader
          eyebrow={copy.contact.eyebrow}
          title={copy.contact.title}
          intro={copy.contact.intro}
        />
      </Reveal>

      {/* Two columns on desktop: the form (left) and reassurance in the formerly
          empty right half (C1). On mobile the reassurance follows the form. */}
      <div className="grid gap-14 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-20">
        <div>
          <ContactForm />

          <p className="mt-10 text-sm text-muted">
            {site.contact.email ? (
              <>
                Ou écrivez-moi directement à{" "}
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
                >
                  {site.contact.email}
                </a>
                , ou retrouvez-moi sur{" "}
              </>
            ) : (
              <>Ou retrouvez-moi sur{" "}</>
            )}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
            >
              Instagram
            </a>
            .
          </p>
        </div>

        <Reveal delay={120} className="lg:mt-10">
          <aside className="border-t border-line pt-10 lg:border-0 lg:pt-0">
            <h2 className="font-serif text-2xl text-ink">
              {copy.contact.reassurance.title}
            </h2>
            <ol className="mt-6 space-y-5">
              {copy.contact.reassurance.steps.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-muted">
                  <span
                    aria-hidden
                    className="font-serif text-base leading-6 text-clay"
                  >
                    {i + 1}
                  </span>
                  <span className="text-pretty">{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </Reveal>
      </div>
    </Container>
  );
}
