// quote — the client's words: outranks every brand element near it. Real name
// attribution always (no anonymous proof — content law, enforced at P15).

export function Quote(props: { children: React.ReactNode; attribution: string }) {
  const { children, attribution } = props;
  return (
    <figure className="max-w-measure">
      <blockquote className="text-quote text-ink">{children}</blockquote>
      <figcaption className="mt-4 text-small text-ink-secondary">
        <cite className="not-italic">{attribution}</cite>
      </figcaption>
    </figure>
  );
}
