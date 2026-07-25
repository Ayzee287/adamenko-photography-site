"use client";

// success-state — relief: replaces the form after send; focus moves to the
// heading (announced via the island's live region as well). Voice: hers.

import { useEffect, useRef } from "react";

export function SuccessState(props: { heading: string; body: string }) {
  const { heading, body } = props;
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="max-w-measure">
      <h3 ref={ref} tabIndex={-1} className="text-h3 text-ink">
        {heading}
      </h3>
      <p className="mt-5 text-body text-ink">{body}</p>
    </div>
  );
}
