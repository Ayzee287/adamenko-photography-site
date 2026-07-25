// error-state (form scope) — blameless failure, nothing lost: plain message +
// the mailto way out, inline above the submit. No banner, no background, no
// icon. Field-scope errors live inside the field components.

import { TextLink } from "@/components/actions/text-link";

export function ErrorState(props: {
  message: string;
  mailtoHref: string;
  mailtoLabel: string;
}) {
  const { message, mailtoHref, mailtoLabel } = props;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-error">{message}</p>
      <p>
        <TextLink href={mailtoHref}>{mailtoLabel}</TextLink>
      </p>
    </div>
  );
}
