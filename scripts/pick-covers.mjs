// pick-covers — propose a cover photograph for every story, from measurements.
//
// A cover is not "the best photograph". It is the frame that survives being cropped to
// several different shapes, at several sizes, while still reading as this shoot. Those are
// measurable properties, so this measures them instead of guessing:
//
//   crop survival   how much of the frame is still there after the tightest crop the
//                   layout applies (cine 21:9 lead, 3:2 strip, and the mobile 3:2)
//   centre weight   where the detail actually sits — a subject drifting to an edge is the
//                   first thing a crop removes
//   sharpness       variance of the Laplacian, on the centre region that survives cropping
//   exposure        mean luminance plus clipping at both ends
//   consistency     distance from the PORTFOLIO's median tone, so 13 covers hang together
//                   rather than each being locally optimal
//
// It writes nothing. It prints a ranked proposal per story and flags any story whose best
// candidate is still weak, because forcing a bad cover is worse than saying so.
//
//   node scripts/pick-covers.mjs            all stories
//   node scripts/pick-covers.mjs --json     machine-readable, for applying the result

import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("public/stories");
const asJson = process.argv.includes("--json");

// The shapes a cover is actually cropped to on this site.
const CROPS = [21 / 9, 3 / 2];

/** Fraction of the source frame still visible after a centre-crop to `target` ratio. */
function cropSurvival(w, h, target) {
  const ar = w / h;
  return ar > target ? target / ar : ar / target;
}

/** Variance of a 3x3 Laplacian over a grayscale buffer — the standard focus measure. */
function laplacianVariance(data, w, h) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const v =
        -4 * data[i] + data[i - 1] + data[i + 1] + data[i - w] + data[i + w];
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

/**
 * Where the detail sits, as a 0..1 score: 1 = concentrated centrally, 0 = pushed to the
 * edges. Computed from per-cell edge energy weighted by distance from centre, so it
 * answers "will a crop cut the subject" rather than "is there a face".
 */
function centreWeight(data, w, h) {
  const GRID = 9;
  const cells = new Float64Array(GRID * GRID);
  for (let y = 1; y < h - 1; y++) {
    const gy = Math.min(GRID - 1, Math.floor((y / h) * GRID));
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const e = Math.abs(data[i] - data[i + 1]) + Math.abs(data[i] - data[i + w]);
      cells[gy * GRID + Math.min(GRID - 1, Math.floor((x / w) * GRID))] += e;
    }
  }
  let total = 0;
  let weighted = 0;
  const c = (GRID - 1) / 2;
  const maxD = Math.hypot(c, c);
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const v = cells[gy * GRID + gx];
      total += v;
      weighted += v * (1 - Math.hypot(gx - c, gy - c) / maxD);
    }
  }

  // How CONCENTRATED that energy is, as 1 − normalised entropy.
  //
  // Centre weight alone is not enough, and the first run proved it: it happily chose an
  // empty manor, an empty courtyard and a landscape with two distant figures, because
  // architecture and foliage put detail everywhere including the middle. A photograph OF
  // SOMEONE concentrates its detail (the subject is sharp, the background falls away); a
  // wide scene spreads it evenly. This separates the two without needing to detect faces —
  // which matters here, because a large part of this portfolio is black and white and any
  // skin-tone heuristic would be blind to it.
  let entropy = 0;
  if (total > 0) {
    for (let i = 0; i < cells.length; i++) {
      const p = cells[i] / total;
      if (p > 0) entropy -= p * Math.log(p);
    }
  }
  const concentration = total > 0 ? 1 - entropy / Math.log(cells.length) : 0;
  return { centre: total > 0 ? weighted / total : 0, concentration };
}

async function measure(file) {
  const img = sharp(file);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  // Analyse the region that SURVIVES the tightest crop, not the whole frame: sharpness in
  // a corner that always gets cut is not sharpness the visitor will ever see.
  const tightest = Math.min(...CROPS.map((t) => cropSurvival(w, h, t)));
  const { data, info } = await sharp(file)
    .extract({
      left: Math.floor((w * (1 - tightest)) / 2),
      top: Math.floor((h * (1 - tightest)) / 2),
      width: Math.max(1, Math.floor(w * tightest)),
      height: Math.max(1, Math.floor(h * tightest)),
    })
    .greyscale()
    .resize(256, 256, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const stats = await sharp(file).greyscale().stats();
  const mean = stats.channels[0].mean;
  // Clipping: how much of the histogram is jammed against pure black or pure white.
  let dark = 0;
  let blown = 0;
  for (const v of data) {
    if (v <= 4) dark++;
    else if (v >= 251) blown++;
  }
  const clipped = (dark + blown) / data.length;

  return {
    w,
    h,
    ar: w / h,
    survival: tightest,
    sharpness: laplacianVariance(data, info.width, info.height),
    ...centreWeight(data, info.width, info.height),
    mean,
    clipped,
  };
}

const stories = [];
for (const cat of readdirSync(ROOT)) {
  const catDir = path.join(ROOT, cat);
  if (!statSync(catDir).isDirectory()) continue;
  for (const slug of readdirSync(catDir)) {
    const dir = path.join(catDir, slug);
    if (!statSync(dir).isDirectory()) continue;
    stories.push({ cat, slug, dir, files: readdirSync(dir).filter((f) => /\.jpg$/i.test(f)).sort() });
  }
}

// Pass 1 — measure everything, so tone consistency can be judged against the whole portfolio.
const all = [];
for (const s of stories) {
  s.frames = [];
  for (const f of s.files) {
    const m = await measure(path.join(s.dir, f));
    s.frames.push({ file: f, ...m });
    all.push(m);
  }
  if (!asJson) process.stderr.write(`  measured ${s.cat}/${s.slug} (${s.files.length})\n`);
}

const median = (xs) => {
  const a = [...xs].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
};
const medianTone = median(all.map((m) => m.mean));
const maxSharp = Math.max(...all.map((m) => m.sharpness));
// Concentration is normalised against the CORPUS, not used raw: over 81 cells a natural
// photograph's energy is fairly even, so the absolute value lives in a narrow band near
// zero and carries no usable range on its own. What matters is where a frame sits relative
// to the rest of this portfolio.
const maxConc = Math.max(...all.map((m) => m.concentration));

// Pass 2 — score. Weights are deliberately blunt: crop survival and centre weight dominate,
// because a cover's job is to survive the layout; sharpness and exposure are gates more than
// differentiators, and tone consistency is the tie-breaker that makes 13 covers hang together.
const score = (m) => {
  const sharp01 = Math.min(1, Math.sqrt(m.sharpness / maxSharp));
  const conc01 = maxConc > 0 ? Math.min(1, m.concentration / maxConc) : 0;
  const exposure = 1 - Math.min(1, Math.abs(m.mean - 118) / 118) - Math.min(0.5, m.clipped * 4);
  const tone = 1 - Math.min(1, Math.abs(m.mean - medianTone) / 90);
  return {
    total:
      conc01 * 0.38 +
      m.centre * 0.22 +
      sharp01 * 0.16 +
      Math.max(0, exposure) * 0.14 +
      tone * 0.10,
    sharp01,
    conc01,
    exposure: Math.max(0, exposure),
    tone,
  };
};

// Crop survival is a GATE, not a weight.
//
// The layout crops a cover to 21:9 for the lead plate and 3:2 for the strip. A portrait
// frame keeps under a third of itself at 21:9, so however well composed it is, most of it
// is not what the visitor sees. Letting a high subject score outweigh that produced covers
// that were excellent photographs and unusable covers. Below this, a frame is simply not
// eligible — it is not a quality judgement about the photograph.
const MIN_SURVIVAL = 0.55;

// Among ELIGIBLE frames, a cover still has to clear an absolute bar rather than merely win
// its story — the point of the exercise is to refuse a weak cover, not to always produce one.
const WEAK = 0.60;
const out = [];
for (const s of stories) {
  const eligible = s.frames.filter((f) => f.survival >= MIN_SURVIVAL);
  const ranked = (eligible.length ? eligible : s.frames)
    .map((f) => ({ ...f, ...score(f) }))
    .sort((a, b) => b.total - a.total);
  const best = ranked[0];
  out.push({
    id: `${s.cat}/${s.slug}`,
    cat: s.cat,
    slug: s.slug,
    best: best.file,
    total: +best.total.toFixed(3),
    weak: best.total < WEAK || best.survival < MIN_SURVIVAL,
    eligible: eligible.length,
    runners: ranked.slice(1, 4).map((r) => ({ file: r.file, total: +r.total.toFixed(3) })),
    detail: {
      survival: +best.survival.toFixed(3),
      centre: +best.centre.toFixed(3),
      concentration: +best.conc01.toFixed(3),
      sharp: +best.sharp01.toFixed(3),
      exposure: +best.exposure.toFixed(3),
      tone: +best.tone.toFixed(3),
      ar: +best.ar.toFixed(2),
    },
  });
}

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\nportfolio median tone ${medianTone.toFixed(1)} · weak threshold ${WEAK}\n`);
  for (const r of out) {
    console.log(
      `${r.id.padEnd(26)} ${r.best.padEnd(24)} ${r.total.toFixed(3)}${r.weak ? "  ** WEAK **" : ""}`,
    );
    console.log(
      `    survival ${r.detail.survival}  centre ${r.detail.centre}  subject ${r.detail.concentration}  sharp ${r.detail.sharp}` +
        `  exposure ${r.detail.exposure}  tone ${r.detail.tone}  ar ${r.detail.ar}`,
    );
  }
  const weak = out.filter((r) => r.weak);
  console.log(
    weak.length
      ? `\n${weak.length} story/stories have no strong cover: ${weak.map((w) => w.id).join(", ")}`
      : `\nEvery story has a cover clearing the bar.`,
  );
}
