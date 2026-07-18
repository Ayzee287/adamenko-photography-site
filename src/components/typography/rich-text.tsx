// rich-text — running prose. Owns paragraph rhythm (the Figma paragraph
// spacing): body → space/4, body-letter → space/5. Measure-capped, fill to
// max. Serif italic asides arrive as inline nodes (≤2 per page — content law).

import { cn } from "@/lib/utils/cn";

export function RichText(props: {
  voice?: "body" | "body-letter";
  paragraphs: React.ReactNode[];
}) {
  const { voice = "body", paragraphs } = props;
  return (
    <div
      className={cn(
        "w-full max-w-measure",
        voice === "body-letter"
          ? "flex flex-col gap-5 text-body-letter text-ink"
          : "flex flex-col gap-4 text-body text-ink",
      )}
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
