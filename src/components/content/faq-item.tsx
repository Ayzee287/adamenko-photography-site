// faq-item — one objection removed. Native <details>/<summary>: zero JS,
// full keyboard/SR semantics free. Question = sans/body + the one legal
// weight override; chevron = the turn; answer measure-capped ≤90 words
// (content law). One-open-at-a-time via the native `name` attribute —
// the parent passes a shared group name (tarifs page).

export function FaqItem(props: {
  question: string;
  answer: React.ReactNode;
  group?: string;
}) {
  const { question, answer, group } = props;
  return (
    <details name={group} className="group border-b border-hairline">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          viewBox="0 0 20 20"
          className="h-(--size-icon) w-(--size-icon) shrink-0 transition-transform duration-(--duration-standard) ease-(--ease-standard) group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <div className="max-w-measure pb-5 text-body text-ink">{answer}</div>
    </details>
  );
}
