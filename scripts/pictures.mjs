#!/usr/bin/env node
/**
 * Builds every picture the public page shows, from the workspace's source captures.
 *
 *   node scripts/pictures.mjs            (sources in ../media and ./public/profile.jpg)
 *   MEDIA_DIR=/path/to/media node scripts/pictures.mjs
 *
 * Output goes to public/work/… as WebP, cropped and sized for the slot it fills
 * (at most twice the size it is rendered at) and is committed, so a deploy never
 * needs the sources. The table printed at the end is what src/content/pictures.ts
 * records: keep the two in step when a crop changes.
 *
 * Never add Detektif stills 15 or 17: they show a real person's name as an NPC label.
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.resolve(process.env.MEDIA_DIR ?? path.join(ROOT, "..", "media"));
const OUT = path.join(ROOT, "public", "work");

const src = {
  profile: path.join(ROOT, "public", "profile.jpg"),
  keyart: path.join(MEDIA, "detektif", "detektif-art-menu-keyart.webp"),
  map2: path.join(MEDIA, "detektif", "detektif-art-map-stage2.webp"),
  village: path.join(MEDIA, "detektif", "detektif-04-stage1-village-hud-minimap.webp"),
  stage2: path.join(MEDIA, "detektif", "detektif-10-stage2-burnt-forest-fires.webp"),
  stage3: path.join(MEDIA, "detektif", "detektif-14-stage3-burnt-west-rain.webp"),
  analysis: path.join(MEDIA, "detektif", "detektif-12-stage2-analysis-drone-termal.webp"),
  standingsPhone: path.join(MEDIA, "kicaumania", "kicaumania-scoreboard-live-mobile.webp"),
  birdPhone: path.join(MEDIA, "kicaumania", "kicaumania-bird-profile-mobile.webp"),
  homePhone: path.join(MEDIA, "kicaumania", "kicaumania-home-mobile.webp"),
  standings: path.join(MEDIA, "kicaumania", "kicaumania-scoreboard-live-fullpage.webp"),
  home: path.join(MEDIA, "kicaumania", "kicaumania-home-desktop.webp"),
  kusda: path.join(MEDIA, "other", "kusda-gym.webp"),
  logicpro: path.join(MEDIA, "other", "LogicPro-simulasi.webp"),
};

/**
 * One output: source, the region to keep (left, top, width, height in source
 * pixels), the size to write, and how to scale. `pixel` keeps pixel art crisp
 * when it is enlarged; everything else uses the default (Lanczos).
 */
const jobs = [
  // ---- hero portraits, 2:3, at two widths ---------------------------------
  { out: "hero/portrait", from: src.profile, crop: [120, 0, 760, 1140], sizes: [[480, 720], [760, 1140]], quality: 80 },
  { out: "hero/keyart", from: src.keyart, crop: [150, 0, 480, 720], sizes: [[480, 720], [800, 1200]], quality: 84 },
  { out: "hero/standings", from: src.standingsPhone, crop: [0, 620, 712, 1068], sizes: [[480, 720], [712, 1068]], quality: 82 },
  { out: "hero/burnt-land", from: src.map2, crop: [0, 0, 1067, 1600], sizes: [[480, 720], [800, 1200]], quality: 76 },
  { out: "hero/bird-profile", from: src.birdPhone, crop: [0, 0, 780, 1170], sizes: [[480, 720], [780, 1170]], quality: 82 },

  // ---- Detektif Ekosistem ---------------------------------------------------
  // The stage poster is written by scripts/clip.mjs (the first frame of the loop).
  { out: "detektif-ekosistem/village-45", from: src.village, crop: [440, 0, 720, 900], sizes: [[720, 900]], quality: 80 },
  { out: "detektif-ekosistem/analysis-1610", from: src.analysis, crop: [352, 170, 896, 560], sizes: [[896, 560]], quality: 80 },

  // the three stages, for /play/detektif
  { out: "detektif-ekosistem/stage-1", from: src.village, crop: [0, 0, 1600, 900], sizes: [[960, 540]], quality: 78 },
  { out: "detektif-ekosistem/stage-2", from: src.stage2, crop: [0, 0, 1600, 900], sizes: [[960, 540]], quality: 78 },
  { out: "detektif-ekosistem/stage-3", from: src.stage3, crop: [0, 0, 1600, 900], sizes: [[960, 540]], quality: 78 },

  // ---- KicauScore -------------------------------------------------------------
  { out: "kicauscore/standings-desktop", from: src.standings, crop: [0, 0, 1440, 960], sizes: [[1440, 960]], quality: 82 },
  { out: "kicauscore/home-phone", from: src.homePhone, crop: [0, 0, 780, 1360], sizes: [[780, 1360]], quality: 82 },
  { out: "kicauscore/home-card", from: src.home, crop: [100, 96, 1000, 620], sizes: [[1000, 620]], quality: 82 },

  // ---- more work: the pictures the biro holds over a row ------------------------
  { out: "more/kusda-gym", from: src.kusda, crop: [0, 0, 1440, 900], sizes: [[640, 400]], quality: 78 },
  { out: "more/logicpro", from: src.logicpro, crop: [0, 0, 1440, 900], sizes: [[640, 400]], quality: 80 },

  // ---- about: the portrait as a drop capital, square ----------------------------
  { out: "about/portrait-square", from: src.profile, crop: [170, 300, 660, 660], sizes: [[480, 480]], quality: 80 },
];

const rows = [];
for (const job of jobs) {
  const [left, top, width, height] = job.crop;
  for (const [w, h] of job.sizes) {
    const name = job.sizes.length > 1 ? `${job.out}-${w}.webp` : `${job.out}.webp`;
    const file = path.join(OUT, name);
    await mkdir(path.dirname(file), { recursive: true });
    await sharp(job.from)
      .extract({ left, top, width, height })
      .resize(w, h, { fit: "fill", kernel: job.pixel && w > width ? "nearest" : "lanczos3" })
      .webp({ quality: job.quality, effort: 6 })
      .toFile(file);
    const { size } = await stat(file);
    rows.push({ file: `/work/${name}`, width: w, height: h, kB: Math.round(size / 102.4) / 10 });
  }
}

console.table(rows);
const heavy = rows.filter((r) => r.kB > 220);
if (heavy.length) {
  console.error(`Over the 220 kB budget: ${heavy.map((r) => `${r.file} (${r.kB} kB)`).join(", ")}`);
  process.exitCode = 1;
}
