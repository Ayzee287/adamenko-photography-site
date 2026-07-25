// arc — the numbered-beats assembly (EXPERIENCE-ARC on service pages,
// PROCESS on tarifs): HeadingGroup(h2 + kicker) → 4 beats, each
// numeral (metadata register) + h3 + body. 2-up ≥768 (2×2), stacked below,
// gap space/6. Beat 2 carries the honesty beat by CONTENT rule, not code.

import { HeadingGroup } from "@/components/typography/heading-group";

export function Arc(props: {
  kicker: string;
  heading: string;
  support?: string;
  beats: Array<{ title: string; body: string }>;
}) {
  const { kicker, heading, support, beats } = props;
  return (
    <div>
      <HeadingGroup level="h2" kicker={kicker} heading={heading} support={support} />
      <ol className="mt-7 grid gap-6 md:grid-cols-2 md:gap-x-8">
        {beats.map((beat, i) => (
          <li key={i}>
            <p aria-hidden className="text-small text-ink-secondary">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-h3 text-ink">{beat.title}</h3>
            <p className="mt-3 max-w-measure text-body text-ink">{beat.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
