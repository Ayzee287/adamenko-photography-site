import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";

// Brought onto the inner-page system (Design Sprint V2 · D039): the same PageHeader
// grammar, Reveal, opening rhythm and secondary-link CTA as every other page — so
// even the error page reads as part of the one authored product, not a plainer stub.
export default function NotFound() {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader
          eyebrow="Erreur 404"
          title="Cette page n'existe pas."
          intro="La page que vous cherchez a peut-être été déplacée, ou n'existe plus."
        />
        <div className="mt-8">
          <ButtonLink href="/" variant="secondary">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
