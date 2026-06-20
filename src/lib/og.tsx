import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// Shared social-card renderer for the OpenGraph + Twitter image conventions
// (sprint task 4). 100% self-contained — no external photo or remote font fetch —
// so it generates offline at build time and can never break the build on a missing
// asset. It uses the brand palette; @vercel/og's bundled font covers French accents.
// (A custom Fraunces serif card is a deliberate post-launch polish, not a blocker.)
//
// When a real signature photograph exists, this can become an image-backed card;
// the file convention and metadata wiring stay identical.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = `${site.brand} — Photographe à Lyon`;

const ink = "#2a2420";
const paper = "#faf6f0";
const clay = "#b07159";
const muted = "#6f655c";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: paper,
          padding: "80px 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          Photographe · Lyon
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              lineHeight: 1.02,
              color: ink,
              maxWidth: 940,
            }}
          >
            {site.brand}
          </div>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 6,
              backgroundColor: clay,
              margin: "40px 0",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.3,
              color: muted,
              maxWidth: 880,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: muted,
          }}
        >
          <span>{site.location}</span>
          <span>adamenko-photography</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
