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
}) {
  const { src, alt, sizes, priority = false, quality = 82 } = props;
  const blur = blurMap[src];
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className="object-cover"
      {...(blur ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
    />
  );
}
