import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "light" | "ghost";

// Buttons stay neutral by brand rule — no clay-coloured fills, no gradients
// (design-language). `solid` for light sections, `light` for dark bands, `ghost`
// for the quiet underlined text-link. Clay appears only on the ghost underline.
const VARIANTS: Record<Variant, string> = {
  solid:
    "inline-flex items-center justify-center px-6 py-3 text-sm bg-ink text-paper hover:bg-ink/85",
  light:
    "inline-flex items-center justify-center px-6 py-3 text-sm bg-paper text-ink hover:bg-paper/85",
  ghost:
    "inline-flex items-center border-b border-clay pb-1 text-sm text-ink hover:text-clay",
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = cn(VARIANTS[variant], className);
  const external = /^https?:\/\//.test(href);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
