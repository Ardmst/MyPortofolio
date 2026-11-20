#!/usr/bin/env node
/**
 * Builds the one moving picture on the page: the animated background of the
 * Detektif Ekosistem main menu (120 frames at 12 fps, the game's own asset),
 * as a muted loop for the game stage, plus its poster (the first frame).
 *
 *   node scripts/clip.mjs      (needs ffmpeg on PATH; frames in ../game-web/src/assets/ui/menu_anim)
 *   FRAMES_DIR=/path/to/menu_anim node scripts/clip.mjs
 *
 * Output (committed): public/work/detektif-ekosistem/menu-loop.{webm,mp4} and stage-poster.webp.
 */
import { execFileSync } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRAMES = path.resolve(process.env.FRAMES_DIR ?? path.join(ROOT, "..", "game-web", "src", "assets", "ui", "menu_anim"));
const OUT = path.join(ROOT, "public", "work", "detektif-ekosistem");
const input = ["-y", "-loglevel", "error", "-framerate", "12", "-i", path.join(FRAMES, "frame_%03d.png")];

execFileSync("ffmpeg", [...input, "-an", "-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-b:v", "0", "-crf", "40", "-g", "120", "-row-mt", "1", "-deadline", "good", "-cpu-used", "1", path.join(OUT, "menu-loop.webm")], { stdio: "inherit" });
execFileSync("ffmpeg", [...input, "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "slow", "-crf", "29", "-g", "120", "-movflags", "+faststart", path.join(OUT, "menu-loop.mp4")], { stdio: "inherit" });
await sharp(path.join(FRAMES, "frame_000.png")).webp({ quality: 84, effort: 6 }).toFile(path.join(OUT, "stage-poster.webp"));

for (const name of ["menu-loop.webm", "menu-loop.mp4", "stage-poster.webp"]) {
  const { size } = await stat(path.join(OUT, name));
  console.log(`${name}\t${Math.round(size / 1024)} kB`);
}
