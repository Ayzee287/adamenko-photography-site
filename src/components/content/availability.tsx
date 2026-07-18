// availability — honest scarcity, one sentence, no urgency styling (no
// countdowns, no badges — DNA law). Absent gracefully: parents simply don't
// render it. Surface variant: Body on dark (close band) / Small on paper
// (reassurance) — colors ride the .surface-dark scope.

export function Availability(props: {
  sentence: string;
  surface?: "dark" | "paper";
}) {
  const { sentence, surface = "dark" } = props;
  return (
    <p
      className={
        surface === "dark"
          ? "text-body text-ink-secondary"
          : "text-small text-ink-secondary"
      }
    >
      {sentence}
    </p>
  );
}
