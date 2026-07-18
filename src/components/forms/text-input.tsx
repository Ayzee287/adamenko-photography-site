// text-input — label ALWAYS visible above (never placeholder-as-label),
// optional fields marked "(facultatif)" (required unmarked — the frozen
// convention), field 56px (--size-control-field), radius-field, hairline;
// error = clay border + linked message (aria-invalid + aria-describedby).
// Server-renderable; the island wires blur handlers through native props.

import { cn } from "@/lib/utils/cn";

export interface FieldChrome {
  id: string;
  name: string;
  label: string;
  optionalSuffix?: string; // "(facultatif)" when the field is optional
  error?: string; // message text — presence = error state
  defaultValue?: string;
}

export function fieldDescribedBy(id: string, error?: string) {
  return error ? `${id}-error` : undefined;
}

export function FieldLabel(props: {
  htmlFor: string;
  label: string;
  optionalSuffix?: string;
}) {
  const { htmlFor, label, optionalSuffix } = props;
  return (
    <label htmlFor={htmlFor} className="text-label text-ink">
      {label}
      {optionalSuffix && (
        <span className="text-ink-secondary"> {optionalSuffix}</span>
      )}
    </label>
  );
}

export function FieldError(props: { id: string; error?: string }) {
  const { id, error } = props;
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-2 text-small text-error">
      {error}
    </p>
  );
}

export const fieldClasses = (error?: string) =>
  cn(
    "h-(--size-control-field) w-full rounded-field border bg-paper px-4 text-body text-ink",
    error ? "border-error" : "border-hairline",
  );

export function TextInput(
  props: FieldChrome & {
    type?: "text" | "email";
    required?: boolean;
    autoComplete?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  },
) {
  const {
    id,
    name,
    label,
    optionalSuffix,
    error,
    defaultValue,
    type = "text",
    required,
    autoComplete,
    onBlur,
  } = props;
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={id} label={label} optionalSuffix={optionalSuffix} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, error)}
        className={fieldClasses(error)}
      />
      <FieldError id={id} error={error} />
    </div>
  );
}
