/**
 * Builds `public/profile.jpg` from the original portrait.
 *
 * There is no AI raster editor available in this environment, so the artwork is
 * produced deterministically with sharp: desaturate → deepen contrast → push a
 * cool monochrome tint → composite a subject-centred spotlight vignette and a
 * bottom fade so the photo dissolves into the page background (#09090b) instead
 * of sitting on it as a bright rectangle.
 *
 * Usage:
 *   node scripts/make-profile.mjs <input-image> [output.jpg] [variant]
 *
 * Variants: `neutral` (default) | `cool` | `noir`
 */
import path from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const input = process.argv[2];
const output = process.argv[3] ?? path.join("public", "profile.jpg");
const variant = process.argv[4] ?? "neutral";

if (!input) {
  console.error("Usage: node scripts/make-profile.mjs <input-image> [output.jpg] [variant]");
  process.exit(1);
}

const WIDTH = 1000;
const HEIGHT = 1250; // 4:5, matching the `aspect-4/5` frame in profile-photo.tsx

/** Face position in the source frame, measured from the original photo. */
const FOCUS = { x: 0.49, y: 0.34 };

const VARIANTS = {
  neutral: { contrast: 1.22, offset: -26, tint: null },
  cool: { contrast: 1.24, offset: -28, tint: { r: 224, g: 234, b: 250 } },
  noir: { contrast: 1.42, offset: -40, tint: { r: 208, g: 222, b: 244 } },
};

const settings = VARIANTS[variant];
if (!settings) {
  console.error(`Unknown variant "${variant}". Use: ${Object.keys(VARIANTS).join(", ")}`);
  process.exit(1);
}

/**
 * Spotlight + fade overlay.
 *
 * The radial gradient keeps the subject readable while pushing the busy
 * background (trees, parked bikes) deep into shadow, which is what makes the
 * cut-out look unnecessary — no segmentation required.
 */
function overlay() {
  const cx = (FOCUS.x * 100).toFixed(1);
  const cy = (FOCUS.y * 100).toFixed(1);

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <radialGradient id="spot" cx="${cx}%" cy="${cy}%" r="62%">
          <stop offset="0%" stop-color="#09090b" stop-opacity="0"/>
          <stop offset="42%" stop-color="#09090b" stop-opacity="0.06"/>
          <stop offset="68%" stop-color="#09090b" stop-opacity="0.55"/>
          <stop offset="88%" stop-color="#09090b" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="0.97"/>
        </radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#09090b" stop-opacity="0.55"/>
          <stop offset="18%" stop-color="#09090b" stop-opacity="0.10"/>
          <stop offset="52%" stop-color="#09090b" stop-opacity="0"/>
          <stop offset="76%" stop-color="#09090b" stop-opacity="0.42"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="1"/>
        </linearGradient>
        <radialGradient id="rim" cx="${cx}%" cy="${cy}%" r="46%">
          <stop offset="55%" stop-color="#3b82f6" stop-opacity="0"/>
          <stop offset="82%" stop-color="#3b82f6" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#spot)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#rim)"/>
    </svg>`,
  );
}

let pipeline = sharp(input)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "top" })
  .grayscale()
  .linear(settings.contrast, settings.offset)
  .normalise({ lower: 1, upper: 99 });

if (settings.tint) pipeline = pipeline.tint(settings.tint);

pipeline = pipeline
  .composite([{ input: overlay(), blend: "over" }])
  .modulate({ brightness: 1.02 });

await mkdir(path.dirname(output), { recursive: true });

const info = await pipeline
  .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(output);

console.log(`wrote ${output} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
