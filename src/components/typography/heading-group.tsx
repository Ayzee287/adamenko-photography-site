// heading-group — the standard text-group bond: kicker → heading → optional
// support line. Gaps: kicker→heading space/3, heading→support space/4.
// Semantic mapping: display→h1 (once per page), h2→h2, h3→h3. Support voice:
// sans (facts) or serif (feeling) — the two-voice law made a prop.

import { Kicker } from "./kicker";
import { cn } from "@/lib/utils/cn";

const headingRole = {
  display: { El: "h1", cls: "text-display" },
  h2: { El: "h2", cls: "text-h2" },
  h3: { El: "h3", cls: "text-h3" },
} as const;

export function HeadingGroup(props: {
  level: "display" | "h2" | "h3";
  kicker?: React.ReactNode;
  kickerTone?: "ink-secondary" | "bronze";
  heading: React.ReactNode;
  support?: React.ReactNode;
  supportVoice?: "sans" | "serif";
}) {
  const {
    level,
    kicker,
    kickerTone,
    heading,
    support,
    supportVoice = "sans",
  } = props;
  const { El, cls } = headingRole[level];
  return (
    <div className={cn(support != null && "max-w-measure")}>
      {kicker != null && <Kicker tone={kickerTone}>{kicker}</Kicker>}
      <El className={cn(cls, "text-ink", kicker != null && "mt-3")}>
        {heading}
      </El>
      {support != null && (
        <p
          className={cn(
            "mt-4",
            supportVoice === "serif"
              ? "text-body-letter text-ink"
              : "text-body text-ink-secondary",
          )}
        >
          {support}
        </p>
      )}
    </div>
  );
}
