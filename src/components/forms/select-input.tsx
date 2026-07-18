// select-input — native select styled as the field: chevron inset space/4,
// placeholder "Choisissez…" in the secondary tone until a value is chosen.
// prefilled = the referrer's session type (the census boolean, as data).

import {
  FieldError,
  FieldLabel,
  fieldClasses,
  fieldDescribedBy,
  type FieldChrome,
} from "./text-input";
import { cn } from "@/lib/utils/cn";

export function SelectInput(
  props: FieldChrome & {
    options: Array<{ value: string; label: string }>;
    placeholder: string;
    required?: boolean;
    onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  },
) {
  const {
    id,
    name,
    label,
    optionalSuffix,
    error,
    defaultValue,
    options,
    placeholder,
    required,
    onBlur,
  } = props;
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={id} label={label} optionalSuffix={optionalSuffix} />
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, error)}
          className={cn(fieldClasses(error), "appearance-none pr-8")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-4 top-1/2 h-(--size-icon) w-(--size-icon) -translate-y-1/2 text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}
