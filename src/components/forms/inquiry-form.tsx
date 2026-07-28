"use client";

// inquiry-form — the conversion island (frozen contract):
// · useActionState against the server action (progressive: posts without JS)
// · blur-only validation via the SHARED schema (typing never errors)
// · input NEVER cleared: every error path echoes values; React 19's
//   post-action reset re-fills from state.values via defaultValue
// · pending: submit disabled + aria-busy (no duplicate submissions)
// · failure: form-scope ErrorState above the submit + mailto way out
// · success: SuccessState replaces the form, focus lands on its heading
// · aria-invalid/aria-describedby per field; polite live region for status
// · V1 pattern kept: after a failed submit, focus the first invalid field
// · honeypot: sr-only + aria-hidden + tabIndex −1 ("company")
// · provenance: origin + locale ride hidden fields (the measurement law)

import { useActionState, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  initialInquiryState,
  validateField,
  type InquiryField,
  type InquiryState,
} from "@/lib/forms/inquiry-schema";
import { TextInput } from "./text-input";
import { TextArea } from "./textarea";
import { SelectInput } from "./select-input";
import { SubmitButton } from "./submit-button";
import { SuccessState } from "./success-state";
import { ErrorState } from "./error-state";

export interface InquiryFormLabels {
  name: string;
  email: string;
  sessionType: string;
  sessionTypePlaceholder: string;
  period: string;
  place: string;
  message: string;
  source: string;
  sourcePlaceholder: string;
  optionalSuffix: string; // "(facultatif)"
  honeypot: string; // "Ne pas remplir"
  submit: string;
  sending: string;
  errors: Record<InquiryField, string>;
  formError: string;
  mailtoLabel: string;
  success: { heading: string; body: string };
  statusSent: string; // live-region success announcement
  statusError: string; // live-region error announcement
}

export function InquiryForm(props: {
  action: (prev: InquiryState, formData: FormData) => Promise<InquiryState>;
  labels: InquiryFormLabels;
  sessionTypes: Array<{ value: string; label: string }>;
  sources?: Array<{ value: string; label: string }>;
  prefilledSessionType?: string;
  origin: string;
  locale: string;
  mailtoHref: string;
}) {
  const {
    action,
    labels,
    sessionTypes,
    sources,
    prefilledSessionType,
    origin,
    locale,
    mailtoHref,
  } = props;
  const [state, formAction, pending] = useActionState(
    action,
    initialInquiryState,
  );
  // Blur overrides are keyed to the state GENERATION: a new server response
  // resets them by derivation (derive-never-store — the house rule; no
  // setState-in-effect). Effective error = override if the user re-blurred
  // the field since this response, otherwise the server's verdict.
  const [override, setOverride] = useState<{
    generation: InquiryState;
    map: ReadonlyMap<InquiryField, boolean>;
  }>({ generation: initialInquiryState, map: new Map() });
  const overrides =
    override.generation === state
      ? override.map
      : (new Map() as ReadonlyMap<InquiryField, boolean>);
  const formRef = useRef<HTMLFormElement>(null);

  // V1 pattern: after a failed submit, focus the first invalid field
  // (a pure side effect — no state writes).
  useEffect(() => {
    if (state.status === "error") {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
    }
  }, [state]);

  // A visitor who read a whole service dossier and clicked its one CTA has already said which
  // séance they want; the form then asks again, in a REQUIRED field. The dossiers, genre
  // galleries and story pages now link to `?seance=<slug>`, and this reads it.
  //
  // Read AFTER MOUNT, from the DOM, rather than from the server's `searchParams`. Taking it
  // on the server opts the whole page out of static rendering — measured: /contact moved from
  // ● SSG to ƒ Dynamic — which buys a preselected option at the price of a serverless
  // invocation on the site's only conversion page. This form is a client component and
  // hydrates either way, so it can do the same work for nothing. Setting an uncontrolled
  // select's value imperatively also keeps the change out of hydration entirely, which
  // `defaultValue` would not (D015 is the reason that matters here).
  //
  // The slug is visitor input, so it is checked against the rendered options; anything else
  // is ignored and the visitor simply chooses for themselves. Runs once: re-applying it after
  // someone has changed the select would overwrite their answer with the URL's.
  const intent = useRef<string | null>(null);
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("seance");
    if (!asked || !sessionTypes.some((s) => s.value === asked)) return;
    const select = formRef.current?.querySelector<HTMLSelectElement>(
      'select[name="sessionType"]',
    );
    if (!select || select.value) return;
    select.value = asked;
    intent.current = asked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The one conversion this site has. Vercel Analytics was mounted but only ever counted
  // page views, so "how many enquiries did the site produce" was a question the business
  // could answer from its inbox and nowhere else — and it could never be attributed to the
  // page the visitor came from. `track` is cookieless, needs no consent banner (the same
  // basis on which the pageview analytics are already declared), and is a no-op off Vercel.
  //
  // The payload carries DIMENSIONS, never the enquiry: which page the form was on, and in
  // which language. No name, no email, no message, no free text — this measures the funnel,
  // and nothing in it could identify the person who converted. `origin` is the attribution
  // that was missing: it says whether the enquiry came from /contact, a service dossier or a
  // gallery. The séance type is deliberately NOT sent — a successful submit clears `values`
  // by design, and re-reading it from the form to make a metric prettier is not a reason to
  // reach back into an enquiry's contents.
  //
  // Guarded by a ref, not just the effect's dependency: `state` is a fresh object per server
  // response so the effect already fires once per submission, but a double-invoked effect in
  // development would otherwise count a conversion twice.
  const counted = useRef<InquiryState | null>(null);
  useEffect(() => {
    if (state.status !== "success" || counted.current === state) return;
    counted.current = state;
    // `origin` alone was the page the form sits on, which is the same string for every
    // enquiry. The stated intent is what distinguishes them, and it is navigation context
    // read from the URL, not something the visitor typed.
    track("inquiry_sent", {
      origin: intent.current ? `${origin}?seance=${intent.current}` : origin,
      locale,
    });
  }, [state, origin, locale]);

  const onBlur =
    (field: InquiryField) =>
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const ok = validateField(field, e.target.value);
      const next = new Map(overrides);
      next.set(field, !ok);
      setOverride({ generation: state, map: next });
    };

  const serverError = (field: InquiryField) =>
    state.status === "error" && state.fieldErrors.includes(field);
  const err = (field: InquiryField) =>
    (overrides.has(field) ? overrides.get(field) : serverError(field))
      ? labels.errors[field]
      : undefined;

  if (state.status === "success") {
    return (
      <div>
        <p aria-live="polite" className="sr-only">
          {labels.statusSent}
        </p>
        <SuccessState
          heading={labels.success.heading}
          body={labels.success.body}
        />
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate>
      <div className="flex flex-col gap-5">
        <TextInput
          id="inquiry-name"
          name="name"
          label={labels.name}
          required
          autoComplete="name"
          defaultValue={state.values.name}
          error={err("name")}
          onBlur={onBlur("name")}
        />
        <TextInput
          id="inquiry-email"
          name="email"
          type="email"
          label={labels.email}
          required
          autoComplete="email"
          defaultValue={state.values.email}
          error={err("email")}
          onBlur={onBlur("email")}
        />
        <SelectInput
          id="inquiry-session-type"
          name="sessionType"
          label={labels.sessionType}
          placeholder={labels.sessionTypePlaceholder}
          options={sessionTypes}
          required
          defaultValue={state.values.sessionType ?? prefilledSessionType}
          error={err("sessionType")}
          onBlur={onBlur("sessionType")}
        />
        <TextInput
          id="inquiry-period"
          name="period"
          label={labels.period}
          optionalSuffix={labels.optionalSuffix}
          defaultValue={state.values.period}
        />
        <TextInput
          id="inquiry-place"
          name="place"
          label={labels.place}
          optionalSuffix={labels.optionalSuffix}
          defaultValue={state.values.place}
        />
        <TextArea
          id="inquiry-message"
          name="message"
          label={labels.message}
          required
          defaultValue={state.values.message}
          error={err("message")}
          onBlur={onBlur("message")}
        />
        {sources && sources.length > 0 && (
          <SelectInput
            id="inquiry-source"
            name="source"
            label={labels.source}
            placeholder={labels.sourcePlaceholder}
            optionalSuffix={labels.optionalSuffix}
            options={sources}
            defaultValue={state.values.source}
          />
        )}

        {/* Honeypot — invisible to humans and assistive tech. */}
        <div aria-hidden className="sr-only">
          <label htmlFor="inquiry-company">{labels.honeypot}</label>
          <input
            id="inquiry-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Provenance (the measurement law). */}
        <input type="hidden" name="origin" value={origin} />
        <input type="hidden" name="locale" value={locale} />

        {state.formError && (
          <ErrorState
            message={labels.formError}
            mailtoHref={mailtoHref}
            mailtoLabel={labels.mailtoLabel}
          />
        )}

        <p aria-live="polite" className="sr-only">
          {pending ? labels.sending : state.formError ? labels.statusError : ""}
        </p>

        <div>
          <SubmitButton
            label={labels.submit}
            sendingLabel={labels.sending}
            pending={pending}
          />
        </div>
      </div>
    </form>
  );
}
