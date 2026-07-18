// textarea — as text-input, message area min 160px (--size-textarea-min),
// vertical resize only.

import {
  FieldError,
  FieldLabel,
  fieldDescribedBy,
  type FieldChrome,
} from "./text-input";
import { cn } from "@/lib/utils/cn";

export function TextArea(
  props: FieldChrome & {
    required?: boolean;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  },
) {
  const { id, name, label, optionalSuffix, error, defaultValue, required, onBlur } =
    props;
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={id} label={label} optionalSuffix={optionalSuffix} />
      <textarea
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, error)}
        className={cn(
          "min-h-(--size-textarea-min) w-full resize-y rounded-field border bg-paper p-4 text-body text-ink",
          error ? "border-error" : "border-hairline",
        )}
      />
      <FieldError id={id} error={error} />
    </div>
  );
}
