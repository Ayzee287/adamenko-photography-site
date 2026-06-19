import { cn } from "@/lib/utils";

/**
 * The one heading rhythm for every homepage section — quiet eyebrow, warm serif
 * title, optional intro. Keeps the long-form page coherent so each section reads
 * as part of one voice, not a stack of templates.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className={cn("mt-4 max-w-2xl text-muted", centered && "mx-auto")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
