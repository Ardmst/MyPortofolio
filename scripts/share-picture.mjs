#!/usr/bin/env node
// The picture a shared link to /play/detektif shows: the game's own menu art, cropped to 1200x630.
// (The home page's picture is drawn in code: src/components/site/ShareImage.tsx.)
//
//   node scripts/share-picture.mjs
//
// Reads public/work/detektif-ekosistem/stage-poster.webp (written by scripts/pictures.mjs) and writes
// opengraph-image.jpg, twitter-image.jpg and their alt texts beside the page.
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const source = "public/work/detektif-ekosistem/stage-poster.webp";
const target = "src/app/(site)/play/detektif/";
const alt = "The menu art of Detektif Ekosistem: two pixel-art detectives, a forest on fire and the burnt land behind it.";

const picture = await sharp(source)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 84, mozjpeg: true })
  .toBuffer();

for (const name of ["opengraph-image", "twitter-image"]) {
  writeFileSync(`${target}${name}.jpg`, picture);
  writeFileSync(`${target}${name}.alt.txt`, alt);
}
console.log(`share picture: 1200x630, ${(picture.length / 1024).toFixed(0)} kB`);
