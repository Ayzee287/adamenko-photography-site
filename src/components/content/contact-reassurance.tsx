// contact-reassurance — answer anxiety before the ask: heading → 3 numbered
// steps → the reply promise → optional availability → optional compact
// review. Complementary landmark; both conditional slots absent-clean (∅).

import { Availability } from "./availability";

export function ContactReassurance(props: {
  heading: string;
  steps: string[];
  promise: string;
  availability?: string;
  review?: React.ReactNode;
}) {
  const { heading, steps, promise, availability, review } = props;
  return (
    <aside className="max-w-measure">
      <h2 className="text-h3 text-ink">{heading}</h2>
      <ol className="mt-5 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span aria-hidden className="text-small text-ink-secondary">
              {i + 1}
            </span>
            <span className="text-body text-ink">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-body text-ink">{promise}</p>
      {availability && (
        <div className="mt-5">
          <Availability sentence={availability} surface="paper" />
        </div>
      )}
      {review && <div className="mt-5">{review}</div>}
    </aside>
  );
}
