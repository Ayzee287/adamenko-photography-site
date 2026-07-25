// submit-button — the pill in its sending state (a PillButton variant, per
// census — zero duplicated styling): label swaps ("Envoi…"), interaction
// disabled (no duplicate submissions), aria-busy; NO spinner — the label
// change IS the loading state. Never removed mid-flight.

import { PillButton } from "@/components/actions/pill-button";

export function SubmitButton(props: {
  label: string;
  sendingLabel: string;
  pending: boolean;
}) {
  const { label, sendingLabel, pending } = props;
  return (
    <PillButton type="submit" disabled={pending} busy={pending}>
      {pending ? sendingLabel : label}
    </PillButton>
  );
}
