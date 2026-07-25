// cross-links — one metadata-toned line of 2–3 sibling TextLinks (the frozen
// adjacency map feeds it); sits directly above the footer. Keeps browsers in
// the loop — pages never end in a dead wall.

import { TextLink } from "@/components/actions/text-link";

export function CrossLinks(props: {
  ariaLabel: string;
  links: Array<{ href: string; label: string }>;
}) {
  const { ariaLabel, links } = props;
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-6">
      {links.map((l) => (
        <TextLink key={l.href} href={l.href} showArrow>
          {l.label}
        </TextLink>
      ))}
    </nav>
  );
}
