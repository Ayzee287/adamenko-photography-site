// kicker — the chapter running-head (Eyebrow style; the only caps register).
// Never a heading element. Bronze tone counts against the 2-per-viewport cap.

import { cn } from "@/lib/utils/cn";

export function Kicker(props: {
  tone?: "ink-secondary" | "bronze";
  children: React.ReactNode;
}) {
  const { tone = "ink-secondary", children } = props;
  return (
    <p
      className={cn(
        "text-kicker",
        tone === "bronze" ? "text-bronze" : "text-ink-secondary",
      )}
    >
      {children}
    </p>
  );
}
