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
    </div>
  );
}
