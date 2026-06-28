import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site, siteHeadline } from "@/content/site";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

// Shared social-card renderer for the OpenGraph + Twitter image conventions.
// Generates offline at build time. Now PHOTO-BACKED (2026-06-25): it embeds the real
// hero photograph (read from /public at build, inlined as a data URI — no network) with
// a legibility scrim and the brand wordmark. If the file is ever missing it falls back
// to the self-contained typographic card, so the build can never break on a missing asset.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = siteHeadline;

const ink = "#2a2420";
const paper = "#faf6f0";
const clay = "#b07159";
const muted = "#6f655c";

/** Inline the hero as a data URI at build, or null if unavailable. */
function heroDataUri(): string | null {
  try {
    const buf = readFileSync(join(process.cwd(), "public/home/hero.jpg"));
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export function renderOgImage(locale: Locale = defaultLocale) {
  const dict = getDictionary(locale);
  const kicker = dict.copy.siteDescriptor; // "Photographe à Lyon" / "Photographer in Lyon"
  const tagline = dict.site.tagline;
  const hero = heroDataUri();
  if (hero) {
    return new ImageResponse(
      (
        <div style={{ position: "relative", display: "flex", width: "100%", height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              backgroundImage:
                "linear-gradient(to top, rgba(26,21,17,0.86) 8%, rgba(26,21,17,0.20) 48%, rgba(26,21,17,0.10) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 80,
              bottom: 72,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 30, letterSpacing: 10, textTransform: "uppercase", color: "rgba(250,246,240,0.75)" }}>{kicker}</div>
            <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, color: paper, marginTop: 18 }}>
              {site.brand}
            </div>
            <div style={{ display: "flex", width: 96, height: 5, backgroundColor: clay, margin: "28px 0" }} />
            <div style={{ display: "flex", fontSize: 30, lineHeight: 1.3, color: "rgba(250,246,240,0.92)", maxWidth: 900 }}>
              {tagline}
            </div>
          </div>
        </div>
      ),
      ogSize,
    );
  }

  // Fallback — the self-contained typographic card (build-safe if the hero is absent).
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
        >{kicker}</div>

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
            {tagline}
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
