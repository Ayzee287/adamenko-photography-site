"use client";

// faq-item — one objection removed, opened with intention. A button + region accordion
// (aria-expanded / aria-controls) whose answer eases open AND closed on a grid-rows
// height transition, the chevron turning with it. Reduced-motion collapses to an instant
// toggle (chambre.css). Independent panels (open as many as you like).

import { useId, useState } from "react";

export function FaqItem(props: {
  question: string;
  answer: React.ReactNode;
  /** Retained for call-site compatibility; panels are independent now. */
  group?: string;
}) {
  const { question, answer } = props;
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="ch-faq" data-open={open}>
      <button
        type="button"
        className="ch-faq-q"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{question}</span>
        <svg
          viewBox="0 0 20 20"
          className="ch-faq-chevron"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      <div id={id} className="ch-faq-a" role="region">
        <div className="ch-faq-a-inner">
          <div className="ch-faq-a-body text-body text-ink-secondary">{answer}</div>
        </div>
      </div>
    </div>
  );
}
