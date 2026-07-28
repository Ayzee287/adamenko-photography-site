// _media/photo — the hidden base layer from the published Figma library
// (QA ruling: image slots are instances of a shared photo base). The ONLY
// place next/image is called: blur-up from V1's generated blurMap, fill+cover,
// CLS structurally impossible because every consumer reserves its box.

import Image from "next/image";
import { blurMap } from "@/lib/image-blur";

export function Photo(props: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  /**
   * Where the SUBJECT is, as a CSS object-position ("50% 32%"). Only matters when the
   * consumer's box crops the frame: `cover` keeps the centre by default, which is the
   * wrong 64% of a photograph whose subject is not centred. Set it from what is actually
   * in the picture, never to expose more of the image for its own sake.
   */
  position?: string;
}) {
  const { src, alt, sizes, priority = false, quality = 82, position } = props;
  const blur = blurMap[src];
  // backgroundPosition rides along with objectPosition, or the blur-up placeholder (a
  // background-image, cover, centred by Next) would be cropped differently from the
  // photograph it stands in for, and the frame would visibly re-seat on decode.
  const aim = position
    ? { style: { objectPosition: position, backgroundPosition: position } }
    : {};
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className="object-cover"
      {...aim}
      {...(blur ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
    />
  );
}
