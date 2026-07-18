// metadata — dates, seasons, attributions: small secondary segments joined by
// interpuncts. Never the sole carrier of critical information.

export function Metadata(props: { segments: React.ReactNode[] }) {
  const { segments } = props;
  return (
    <p className="flex flex-wrap items-center gap-2 text-small text-ink-secondary">
      {segments.map((segment, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>·</span>}
          {segment}
        </span>
      ))}
    </p>
  );
}
