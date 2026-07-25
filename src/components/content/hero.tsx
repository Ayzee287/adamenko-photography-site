// hero — the page opening (S1/S2 as one component): orientation in 3 seconds.
// media="image": OpeningImage (priority — the LCP) + content block
// bottom-left riding the .surface-dark scope; skeleton (service pages) adds
// the fact line with its tout-savoir link and auto-enables the scrim (facts
// may never be borderline-legible — Addendum M5).
// media="paper": HeadingGroup on paper, padding-top space/9.
// Carries the page h1 (HeadingGroup display) — once per page.

import { OpeningImage } from "@/components/media/opening-image";
import { HeadingGroup } from "@/components/typography/heading-group";
import { TextLink } from "@/components/actions/text-link";
import { cn } from "@/lib/utils/cn";

export interface HeroSkeleton {
  /** Fact fragments, keyword-first (M8): "Séance famille à Lyon · 1–2 h · à partir de 290 €" */
  facts: string[];
  link: { href: string; label: string };
}

export function Hero(props: {
  media: "image" | "paper";
  kicker?: string;
  heading: React.ReactNode;
  support?: React.ReactNode;
  supportVoice?: "sans" | "serif";
  image?: { src: string; alt: string };
  skeleton?: HeroSkeleton;
  scrim?: boolean;
}) {
  const {
    media,
    kicker,
    heading,
    support,
    supportVoice,
    image,
    skeleton,
    scrim,
  } = props;

  if (media === "paper" || !image) {
    return (
      <div className="mx-auto max-w-site px-5 pt-9 md:px-8">
        <HeadingGroup
          level="display"
          kicker={kicker}
          heading={heading}
          support={support}
          supportVoice={supportVoice}
        />
      </div>
    );
  }

  const withScrim = scrim ?? skeleton != null;
  return (
    <div className="relative">
      <OpeningImage
        src={image.src}
        alt={image.alt}
        context="viewport-height"
        scrim={withScrim}
        priority
      />
      <div className="surface-dark absolute inset-x-0 bottom-0 p-5 md:p-8">
        <div className="mx-auto max-w-site">
          <div className="max-w-measure">
            <HeadingGroup
              level="display"
              kicker={kicker}
              heading={heading}
              support={skeleton ? undefined : support}
            />
            {skeleton && (
              <p
                className={cn(
                  "mt-4 flex flex-wrap items-center gap-x-3 gap-y-1",
                  "text-body text-ink",
                )}
              >
                {skeleton.facts.map((fact, i) => (
                  <span key={i} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden>·</span>}
                    {fact}
                  </span>
                ))}
                <span aria-hidden>·</span>
                <TextLink href={skeleton.link.href} showArrow>
                  {skeleton.link.label}
                </TextLink>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
