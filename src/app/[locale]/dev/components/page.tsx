// Dev-only component gallery (Roadmap P8 acceptance: renders every census
// component + variants). Tooling, not product — 404 in production builds.

import { notFound } from "next/navigation";
import { link } from "@/lib/routes";
import { Kicker } from "@/components/typography/kicker";
import { HeadingGroup } from "@/components/typography/heading-group";
import { RichText } from "@/components/typography/rich-text";
import { Quote } from "@/components/typography/quote";
import { Metadata } from "@/components/typography/metadata";
import { RatingLine } from "@/components/typography/rating-line";
import { TextLink } from "@/components/actions/text-link";
import { PillButton } from "@/components/actions/pill-button";
import { IconLink } from "@/components/actions/icon-link";
import { ImageFrame } from "@/components/media/image-frame";
import { OpeningImage } from "@/components/media/opening-image";
import { GalleryDemo } from "./gallery-demo";
import { Hero } from "@/components/content/hero";
import { Door } from "@/components/content/door";
import { StoryPreview } from "@/components/content/story-preview";
import { ReviewCard } from "@/components/content/review-card";
import { ReviewGroup } from "@/components/content/review-group";
import { PricingBlock } from "@/components/content/pricing-block";
import { Availability } from "@/components/content/availability";
import { FaqItem } from "@/components/content/faq-item";
import { ContactReassurance } from "@/components/content/contact-reassurance";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { CloseBand } from "@/components/assemblies/close-band";
import { PriceChapter } from "@/components/assemblies/price-chapter";
import { Arc } from "@/components/assemblies/arc";
import { CrossLinks } from "@/components/assemblies/cross-links";
import { SilenceSpacer } from "@/components/assemblies/silence-spacer";
import { submitInquiry } from "@/lib/forms/submit-inquiry";

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline py-8">
      <p className="text-kicker text-ink-secondary">{props.title}</p>
      <div className="mt-5 flex flex-col gap-6">{props.children}</div>
    </section>
  );
}

export default function ComponentsGallery() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="mx-auto max-w-site px-5 py-9 md:px-8">
      <h1 className="text-h2">Components — library v1.0.0</h1>

      <Section title="KICKER">
        <Kicker>Par thème</Kicker>
        <Kicker tone="bronze">Investissement</Kicker>
      </Section>

      <Section title="HEADING-GROUP">
        <HeadingGroup
          level="h2"
          kicker="La photographe"
          heading="Derrière l'objectif."
          support="Je vous mets à l'aise, puis je m'efface."
        />
        <HeadingGroup
          level="h3"
          heading="Grossesse"
          support="Les semaines douces avant l'arrivée du bébé."
          supportVoice="serif"
        />
      </Section>

      <Section title="RICH-TEXT">
        <RichText
          voice="body-letter"
          paragraphs={[
            "Je m'appelle Irina, photographe de famille à Lyon.",
            <>
              Avocate de formation devenue photographe —{" "}
              <em>ici, j&apos;ai posé l&apos;appareil</em>.
            </>,
          ]}
        />
      </Section>

      <Section title="QUOTE">
        <Quote attribution="Taïna F">
          Les clichés qu&apos;elle nous a livrés sont juste sublimes.
        </Quote>
      </Section>

      <Section title="METADATA">
        <Metadata segments={["Automne 2026", "Lyon", "Séance famille"]} />
      </Section>

      <Section title="RATING-LINE">
        <RatingLine
          rating={5}
          count={5}
          href="https://maps.google.com/?cid=6651221479339216458"
          summary="Note Google {rating} / 5 · d'après {count} avis"
          linkLabel="Voir tous les avis sur Google"
          locale="fr"
        />
      </Section>

      <Section title="ACTIONS">
        <TextLink href={link("fr", { page: "galeries" })} showArrow>
          Parcourir les galeries
        </TextLink>
        <TextLink href="mailto:adamenkoiu@gmail.com">
          adamenkoiu@gmail.com
        </TextLink>
        <div>
          <PillButton href={link("fr", { page: "contact" })} showArrow>
            Travaillons ensemble
          </PillButton>
        </div>
        <div className="flex">
          <IconLink
            icon="instagram"
            href="https://instagram.com/adamenko_photography"
            label="Instagram"
          />
          <IconLink
            icon="facebook"
            href="https://facebook.com"
            label="Facebook"
          />
        </div>
      </Section>

      <Section title="IMAGE-FRAME (ratios · caption · story link)">
        <div className="max-w-image-col">
          <ImageFrame
            src="/galleries/familles/familles-01.jpg"
            alt="Une mère et son enfant, front contre front, au soleil couchant."
            ratio="3:2"
            caption="Le dernier dimanche calme avant Jonah."
            storyLink={{ href: link("fr", { page: "seances" }), label: "voir cette séance" }}
          />
        </div>
        <div className="flex gap-5">
          <div className="basis-1/3">
            <ImageFrame
              src="/galleries/couples/couples-01.jpg"
              alt="Un couple complice sous les halles."
              ratio="4:5"
            />
          </div>
          <div className="basis-1/3">
            <ImageFrame
              src="/galleries/couples/couples-02.jpg"
              alt="Un couple, lumière chaude."
              ratio="1:1"
            />
          </div>
        </div>
      </Section>

      <Section title="OPENING-IMAGE (ratio context + scrim)">
        <OpeningImage
          src="/galleries/mariages/mariages-09.jpg"
          alt="Les mariés portés par leurs invités."
          context="ratio"
          ratio="3:2"
          scrim
          priority={false}
        />
      </Section>

      <Section title="GALLERY-GRID + PAIR + LIGHTBOX (interactive)">
        <GalleryDemo />
      </Section>

      <Section title="HERO (paper + image/skeleton)">
        <Hero
          media="paper"
          kicker="Prendre contact"
          heading="Contact"
          support="Parlez-moi de votre projet : la date, le lieu, ce que vous imaginez."
        />
        <Hero
          media="image"
          image={{
            src: "/home/hero.jpg",
            alt: "Des mariés, bras levés face aux collines.",
          }}
          kicker="Photographe · Lyon"
          heading="Vous attendez un enfant."
          skeleton={{
            facts: ["Séance grossesse à Lyon", "1–2 h", "à partir de 290 €"],
            link: { href: link("fr", { page: "tarifs" }), label: "tout savoir" },
          }}
        />
      </Section>

      <Section title="DOOR + STORY-PREVIEW">
        <div className="grid gap-8 md:grid-cols-2">
          <Door
            href={link("fr", { page: "service", service: "grossesse" })}
            image={{
              src: "/galleries/grossesse/grossesse-05.jpg",
              alt: "Future maman en lumière naturelle.",
              ratio: "4:5",
            }}
            noun="Grossesse"
            line="Les semaines douces avant l'arrivée du bébé."
            fact="1–2 h · à partir de 290 €"
          />
          <StoryPreview
            href={link("fr", { page: "seances" })}
            image={{
              src: "/galleries/familles/familles-02.jpg",
              alt: "Une famille à la maison.",
              ratio: "3:2",
            }}
            season="Automne 2026"
            title="Le dernier dimanche calme avant Jonah."
            context="Camille, 34 semaines. Une matinée à la maison."
          />
        </div>
      </Section>

      <Section title="REVIEW-CARD + REVIEW-GROUP (3 = snap row on mobile)">
        <ReviewGroup
          regionLabel="Avis clients Google"
          rating={{
            rating: 5,
            count: 5,
            href: "https://maps.google.com/?cid=6651221479339216458",
            summary: "Note Google {rating} / 5 · d'après {count} avis",
            linkLabel: "Voir tous les avis sur Google",
            locale: "fr",
          }}
        >
          {[
            <ReviewCard
              key="1"
              text="Au-delà d'être quelqu'un d'une grande gentillesse, Irina est très talentueuse ! Elle a su capturer notre mariage exactement comme je l'espérais : poétique, émouvant, élégant. C'était un mariage à la maison et les photos sont magnifiques malgré un décor parfois peu esthétique pour un mariage. Merci Irina pour ces très belles photos."
              name="Jane Hannah"
              date="juillet 2026"
              readMoreLabel="Lire la suite"
            />,
            <ReviewCard
              key="2"
              text="Version française de l'avis, affichée par défaut."
              original={{
                text: "Ирочка, мы рады знакомству. Огромное спасибо!",
                toggleLabel: "Voir l'original",
              }}
              name="Алёна Кислица"
              date="juillet 2026"
              readMoreLabel="Lire la suite"
            />,
            <ReviewCard
              key="3"
              text="La séance photo avec Irina était tout simplement exceptionnelle !"
              name="B Laura"
              date="juin 2026"
              readMoreLabel="Lire la suite"
            />,
          ]}
        </ReviewGroup>
      </Section>

      <Section title="PRICING-BLOCK">
        <div className="max-w-measure">
          <PricingBlock
            name="Séance"
            priceIntro="à partir de"
            priceFrom={290}
            locale="fr"
            description="Famille, grossesse, couple ou portrait, chez vous ou en extérieur."
            inclusions={[
              "1 à 2 heures, un lieu",
              "Préparation et repérage ensemble",
              "Galerie privée en ligne",
              "Photographies retouchées en haute définition",
            ]}
          />
        </div>
      </Section>

      <Section title="AVAILABILITY (paper + dark)">
        <Availability
          sentence="Il reste deux week-ends en octobre."
          surface="paper"
        />
        <div className="surface-dark bg-paper p-5">
          <Availability sentence="Il reste deux week-ends en octobre." />
        </div>
      </Section>

      <Section title="FAQ-ITEM (native exclusive group)">
        <div>
          <FaqItem
            group="dev-faq"
            question="Comment réserver une séance ?"
            answer="Écrivez-moi via le formulaire : on échange, puis on cale la date ensemble."
          />
          <FaqItem
            group="dev-faq"
            question="Et si on n'est pas à l'aise devant l'objectif ?"
            answer="Les dix premières minutes sont toujours un peu raides — c'est normal, ça passe."
          />
        </div>
      </Section>

      <Section title="CONTACT-REASSURANCE (full slots)">
        <ContactReassurance
          heading="Ce qui se passe ensuite"
          steps={[
            "Une réponse sous 48 h.",
            "Un échange sur votre projet — la date, le lieu, ce que vous imaginez.",
            "Une proposition adaptée à votre séance, sans engagement.",
          ]}
          promise="Je réponds sous 48 h."
          availability="Il reste deux week-ends en octobre."
          review={
            <ReviewCard
              compact
              text="Les photos sont sublimes. Nous la recommandons +++."
              name="B Laura"
              date="juin 2026"
              readMoreLabel="Lire la suite"
            />
          }
        />
      </Section>

      <Section title="INQUIRY-FORM (mock action — '[declencher-erreur]' in the message exercises the failure path)">
        <div className="max-w-measure">
          <InquiryForm
            action={submitInquiry}
            labels={{
              name: "Votre nom",
              email: "Votre e-mail",
              sessionType: "Type de séance",
              sessionTypePlaceholder: "Choisissez…",
              period: "Période envisagée",
              place: "Lieu",
              message: "Votre message",
              source: "Comment m'avez-vous trouvée ?",
              sourcePlaceholder: "Choisissez…",
              optionalSuffix: "(facultatif)",
              honeypot: "Ne pas remplir",
              submit: "Envoyer",
              sending: "Envoi…",
              errors: {
                name: "Dites-moi votre nom.",
                email: "Cet e-mail semble incomplet.",
                sessionType: "Choisissez un type de séance.",
                message: "Dites-m'en un peu plus.",
              },
              formError:
                "L'envoi n'a pas fonctionné — ce n'est pas vous, c'est nous. Votre message est conservé.",
              mailtoLabel: "M'écrire directement par e-mail",
              success: {
                heading: "Merci, votre message est bien parti.",
                body: "Je vous réponds sous 48 h, promis.",
              },
              statusSent: "Message envoyé.",
              statusError: "L'envoi a échoué. Votre message est conservé.",
            }}
            sessionTypes={[
              { value: "famille", label: "Famille" },
              { value: "grossesse", label: "Grossesse" },
              { value: "couple", label: "Couple" },
              { value: "mariage", label: "Mariage" },
              { value: "portrait", label: "Portrait" },
            ]}
            prefilledSessionType="grossesse"
            origin="/dev/components"
            locale="fr"
            mailtoHref="mailto:adamenkoiu@gmail.com"
          />
        </div>
      </Section>

      <Section title="ARC (numbered beats)">
        <Arc
          kicker="L'expérience"
          heading="Simple, du premier message aux images."
          support="Chaque étape est simple et vous ressemble."
          beats={[
            { title: "On se rencontre", body: "On échange sur votre projet, vos envies." },
            { title: "On prépare ensemble", body: "Les dix premières minutes sont toujours un peu raides — c'est normal, ça passe." },
            { title: "La séance", body: "Je vous laisse vivre et je photographie ce qui arrive vraiment." },
            { title: "La livraison", body: "Une galerie privée d'images retouchées." },
          ]}
        />
      </Section>

      <Section title="PRICE-CHAPTER (silence → heirloom → block → review → silence)">
        <PriceChapter
          heirloom="Ce que vous achetez, au fond, c'est l'objet que vos enfants se disputeront pour le garder."
          blocks={[
            <PricingBlock
              key="s"
              name="Séance"
              priceIntro="à partir de"
              priceFrom={290}
              locale="fr"
              description="Famille, grossesse, couple ou portrait."
              inclusions={["1 à 2 heures, un lieu", "Galerie privée en ligne", "Photographies retouchées"]}
            />,
          ]}
          review={
            <ReviewCard
              compact
              text="Les photos sont sublimes. Nous la recommandons +++."
              name="B Laura"
              date="juin 2026"
              readMoreLabel="Lire la suite"
            />
          }
        />
      </Section>

      <Section title="CROSS-LINKS + SILENCE">
        <CrossLinks
          ariaLabel="Séances proches"
          links={[
            { href: link("fr", { page: "service", service: "famille" }), label: "Famille" },
            { href: link("fr", { page: "service", service: "couple" }), label: "Couple" },
          ]}
        />
        <p className="text-small text-ink-secondary">— silence below (≥30vh, floored) —</p>
        <SilenceSpacer />
      </Section>

      <Section title="CLOSE-BAND (dark scope, availability on)">
        <CloseBand
          kicker="Contact"
          heading="Travaillons ensemble."
          cta={{ href: link("fr", { page: "contact" }), label: "Écrivez-moi" }}
          promise="Je réponds sous 48 h."
          availability="Il reste deux week-ends en octobre."
        />
      </Section>
    </div>
  );
}
