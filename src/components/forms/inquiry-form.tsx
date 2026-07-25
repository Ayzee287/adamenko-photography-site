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
