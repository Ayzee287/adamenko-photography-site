"use client";

import { useRef, useState, type FormEvent } from "react";
import { copy, site } from "@/content/site";
import { CONTACT_OCCASIONS, type ContactErrorField } from "@/lib/contact";
import { primaryPillClasses } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

/**
 * Inquiry form — the conversion (sprint task 1). Posts JSON to /api/contact, which
 * validates server-side, screens the honeypot, and delivers via Resend.
 *
 * States: idle → sending → success | error. Accessible throughout: labelled fields,
 * `aria-invalid` + `aria-describedby` on rejected fields, an `aria-live` status
 * region, and `aria-busy` on the submit while sending. The visual language (pill
 * submit, hairline inputs, focus:border-clay) is unchanged from the approved system.
 */
type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const t = copy.contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<ContactErrorField[]>([]);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  const hasError = (f: ContactErrorField) => fieldErrors.includes(f);
  const describedBy = (f: ContactErrorField) => (hasError(f) ? `${f}-error` : undefined);

  const inputBase =
    "border bg-paper px-3 py-2 text-ink outline-none focus:border-clay";
  const borderFor = (f: ContactErrorField) =>
    hasError(f) ? "border-clay" : "border-line";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      occasion: String(fd.get("occasion") ?? ""),
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? ""), // honeypot
    };

    setStatus("sending");
    setFieldErrors([]);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      if (res.status === 422) {
        const data = (await res.json().catch(() => null)) as
          | { fields?: ContactErrorField[] }
          | null;
        setFieldErrors(data?.fields ?? []);
      }
      setStatus("error");
      // Move attention to the error summary for screen readers + keyboard users.
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      setStatus("error");
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  // Success replaces the form with the confirmation, so nothing dangles after submit.
  if (status === "success") {
    return (
      <p
        role="status"
        className="mt-10 max-w-xl border-l-2 border-clay pl-4 text-ink"
      >
        {t.success}
      </p>
    );
  }

  return (
    <form className="mt-10 flex max-w-xl flex-col gap-5" onSubmit={onSubmit} noValidate>
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="name">
        {t.name}
        <input
          id="name"
          type="text"
          name="name"
          required
          autoComplete="name"
          aria-invalid={hasError("name")}
          aria-describedby={describedBy("name")}
          className={cn(inputBase, borderFor("name"))}
        />
        {hasError("name") ? (
          <span id="name-error" className="text-xs text-clay">
            {t.errors.name}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="email">
        {t.email}
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          aria-invalid={hasError("email")}
          aria-describedby={describedBy("email")}
          className={cn(inputBase, borderFor("email"))}
        />
        {hasError("email") ? (
          <span id="email-error" className="text-xs text-clay">
            {t.errors.email}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="occasion">
        {t.occasion}
        <select
          id="occasion"
          name="occasion"
          aria-invalid={hasError("occasion")}
          aria-describedby={describedBy("occasion")}
          className={cn(inputBase, borderFor("occasion"))}
          defaultValue={CONTACT_OCCASIONS[0]}
        >
          {CONTACT_OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="message">
        {t.message}
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={hasError("message")}
          aria-describedby={describedBy("message")}
          className={cn(inputBase, borderFor("message"))}
        />
        {hasError("message") ? (
          <span id="message-error" className="text-xs text-clay">
            {t.errors.message}
          </span>
        ) : null}
      </label>

      {/* Honeypot — hidden from people + assistive tech; bots that fill it are dropped
          server-side. Off-screen (not display:none) so naive bots still see it. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="company">Ne pas remplir</label>
        <input
          id="company"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Pill submit — shares the canonical primary-pill shape with ButtonLink
          (primaryPillClasses); only the form-specific disabled states are added. */}
      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className={cn(
          primaryPillClasses(),
          "self-start disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-ink",
        )}
      >
        {status === "sending" ? t.sending : t.submit}
      </button>

      {status === "error" ? (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="text-sm text-clay outline-none"
        >
          {t.error}{" "}
          {site.contact.email ? (
            <a
              href={`mailto:${site.contact.email}`}
              className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
            >
              {site.contact.email}
            </a>
          ) : (
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
            >
              Instagram
            </a>
          )}
        </p>
      ) : null}
    </form>
  );
}
