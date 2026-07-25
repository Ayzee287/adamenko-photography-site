// story-preview — invitation into one séance: image + season kicker +
// title-sentence + ONE context line (no excerpt paragraphs — frozen law).
// Same interaction skeleton as door.

import Link from "next/link";
import { ImageFrame, type ImageRatio } from "@/components/media/image-frame";
import { Kicker } from "@/components/typography/kicker";

export function StoryPreview(props: {
  href: string;
  image: { src: string; alt: string; ratio: ImageRatio; sizes?: string };
  season: string;
  title: string;
  context: string;
}) {
  const { href, image, season, title, context } = props;
  return (
    <Link href={href} className="group block active:opacity-(--opacity-press)">
      <ImageFrame {...image} />
      <div className="mt-4">
        <Kicker>{season}</Kicker>
      </div>
      <h3 className="mt-3 text-h3 text-ink underline-offset-4 decoration-1 group-hover:underline group-hover:decoration-ink">
        {title}
      </h3>
      <p className="mt-2 text-body-letter text-ink">{context}</p>
    </Link>
  );
}
