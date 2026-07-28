// Render every distinct transactional email to disk, so they can be looked at instead of
// imagined. Writes .html (what a client renders) and .txt (what a plain-text client shows)
// for each variant into .email-preview/, plus an index.
//
//   npm run email:preview
//   NEXT_PUBLIC_SITE_URL=https://www.adamenko-photography.com npm run email:preview
//
// The second form is worth using: with no origin configured the site links are omitted
// (a transactional email must never ship a localhost URL), so that run previews the
// no-origin variant rather than the one real recipients get.
//
// Nothing here sends mail — it imports the same builders the server action uses.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// The templates are TypeScript with "@/…" imports; compile + resolve them on the fly.
register("./email-preview-loader.mjs", pathToFileURL("./scripts/"));

const { buildOwnerNotification, buildVisitorConfirmation } =
  await import("../src/lib/email/templates.ts");

const OUT = ".email-preview";

/** A realistic full inquiry — every optional field present. */
const full = {
  name: "Camille Durand",
  email: "camille.durand@example.com",
  occasion: "Mariage",
  message:
    "Bonjour Irina,\n\nNous nous marions le 12 juin 2027 en Bretagne, près de Saint-Malo, et votre reportage sur la côte nous a beaucoup touchés.\n\nNous serons une soixantaine d'invités et nous aimerions une couverture de la préparation jusqu'au début de soirée. Est-ce que cette date est encore libre ?\n\nMerci beaucoup,\nCamille & Thomas",
  period: "Juin 2027",
  place: "Saint-Malo, Bretagne",
  source: "Instagram",
};

/** The minimum a visitor can submit — no period, no place, no source. */
const minimal = {
  name: "Léa",
  email: "lea@example.com",
  occasion: "Famille",
  message: "Bonjour, je souhaiterais une séance famille cet automne. Merci !",
};

/** The stress case: a long unbroken token, accents, and markup that must stay inert. */
const hostile = {
  name: 'Jean-Éric <script>alert(1)</script> "Bob" & fils',
  email:
    "jean-eric.de-la-tour-du-pin-longuement@exemple-tres-long-domaine.example.com",
  occasion: "Grossesse",
  message:
    "Voir https://www.exemple.com/une-adresse-vraiment-tres-longue-sans-aucun-tiret-" +
    "a".repeat(70) +
    " et <b>ceci</b> ne doit pas devenir du gras.",
  period: "Septembre 2026",
  place: "Lyon 6e",
  source: "Une amie",
};

const variants = [
  [
    "owner-full",
    "Owner notification — full inquiry (FR)",
    buildOwnerNotification(full),
  ],
  [
    "owner-minimal",
    "Owner notification — minimal inquiry (FR)",
    buildOwnerNotification(minimal),
  ],
  [
    "owner-hostile",
    "Owner notification — hostile input + long token (FR)",
    buildOwnerNotification(hostile),
  ],
  [
    "visitor-fr",
    "Visitor confirmation (FR)",
    buildVisitorConfirmation(full, "fr"),
  ],
  [
    "visitor-en",
    "Visitor confirmation (EN)",
    buildVisitorConfirmation(full, "en"),
  ],
];

await mkdir(OUT, { recursive: true });

const rows = [];
for (const [slug, label, mail] of variants) {
  await writeFile(path.join(OUT, `${slug}.html`), mail.html, "utf8");
  await writeFile(
    path.join(OUT, `${slug}.txt`),
    `Subject: ${mail.subject}\n${"=".repeat(60)}\n\n${mail.text}\n`,
    "utf8",
  );
  rows.push({
    slug,
    label,
    subject: mail.subject,
    bytes: Buffer.byteLength(mail.html),
  });
  console.log(
    `${slug.padEnd(16)} ${String(Buffer.byteLength(mail.html)).padStart(6)} B  ${mail.subject}`,
  );
}

// A contact sheet: every email side by side, at a phone width and a desktop width.
const frames = rows
  .map(
    (r) => `
  <section>
    <h2>${r.label}</h2>
    <p class="subj"><b>Subject:</b> ${r.subject} &nbsp;·&nbsp; <a href="${r.slug}.txt">plain text</a></p>
    <div class="pair">
      <figure><figcaption>desktop · 680px</figcaption><iframe src="${r.slug}.html" width="680" height="900"></iframe></figure>
      <figure><figcaption>mobile · 360px</figcaption><iframe src="${r.slug}.html" width="360" height="900"></iframe></figure>
    </div>
  </section>`,
  )
  .join("\n");

await writeFile(
  path.join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Email preview</title>
<style>
  body{margin:0;padding:24px;background:#f4f4f5;font:14px/1.5 ui-sans-serif,system-ui,sans-serif;color:#18181b}
  h1{font-size:18px;margin:0 0 20px}
  section{margin:0 0 40px;background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:16px}
  h2{font-size:15px;margin:0 0 6px}
  .subj{margin:0 0 12px;color:#52525b;font-size:13px}
  .pair{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  figcaption{font-size:11px;color:#71717a;margin-bottom:6px}
  iframe{border:1px solid #d4d4d8;background:#fff}
</style>
<h1>Adamenko Photography — transactional email preview</h1>
${frames}`,
  "utf8",
);

console.log(
  `\nWrote ${rows.length} emails to ${OUT}/ — open ${OUT}/index.html`,
);
