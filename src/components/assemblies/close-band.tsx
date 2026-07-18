// close-band — the dark close (Journey/Decision pages, ALWAYS last; absent on
// Terminal/Utility): the one dark surface outside the lightbox. Rides the
// .surface-dark scope — every child remaps, zero per-child color logic.
// Left-aligned (Addendum ruling: centering exists only on 404). Anatomy:
// HeadingGroup(h2 + kicker) → PillButton(arrow) → promise line → Availability
// (conditional, absent-clean).

import { HeadingGroup } from "@/components/typography/heading-group";
import { PillButton } from "@/components/actions/pill-button";
import { Availability } from "@/components/content/availability";

export function CloseBand(props: {
  kicker: string;
  heading: string;
  cta: { href: string; label: string };
  promise: string;
  availability?: string;
}) {
  const { kicker, heading, cta, promise, availability } = props;
  return (
    <section className="surface-dark bg-paper">
      <div className="mx-auto max-w-site px-5 py-10 md:px-8">
        <div className="max-w-measure">
          <HeadingGroup level="h2" kicker={kicker} heading={heading} />
          <div className="mt-6">
            <PillButton href={cta.href} showArrow>
              {cta.label}
            </PillButton>
          </div>
          <p className="mt-5 text-body text-ink-secondary">{promise}</p>
          {availability && (
            <div className="mt-3">
              <Availability sentence={availability} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
