"use client";

import { useState } from "react";
import { copy } from "@/content/site";

/**
 * Inquiry form — the conversion. Accessible labels, a real "type of session"
 * select tied to the five genres, and a clear submitted state.
 *
 * NOT YET WIRED TO DELIVERY. Wiring to an email/spam-guarded endpoint
 * (e.g. a Route Handler + Resend, or Formspree) is a launch blocker tracked in
 * the vault roadmap. Until then submit is intercepted and shows a notice rather
 * than silently failing.
 */
const DELIVERY_WIRED = false;

export function ContactForm() {
  const t = copy.contact.form;
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-10 flex max-w-xl flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="flex flex-col gap-2 text-sm text-ink">
        {t.name}
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          className="border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-clay"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink">
        {t.email}
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-clay"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink">
        {t.occasion}
        <select
          name="occasion"
          className="border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-clay"
        >
          <option>Famille</option>
          <option>Grossesse</option>
          <option>Couple</option>
          <option>Portrait</option>
          <option>Mariage</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink">
        {t.message}
        <textarea
          name="message"
          rows={5}
          required
          className="border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-clay"
        />
      </label>

      <button
        type="submit"
        className="self-start border border-ink px-6 py-2 text-sm text-ink hover:border-clay hover:text-clay"
      >
        {t.submit}
      </button>

      {submitted ? (
        <p role="status" className="text-sm text-clay">
          {DELIVERY_WIRED ? t.success : t.pending}
        </p>
      ) : null}
    </form>
  );
}
