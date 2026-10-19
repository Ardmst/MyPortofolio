/**
 * Generate favicon files from the user's original shield logo.
 * Uses sharp to resize and convert with proper dark background.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const SOURCE = 'C:\\Users\\ardii\\.gemini\\antigravity\\brain\\5165f194-9fc1-4e65-b362-47e457c63fda\\.user_uploaded\\media_1792443435220_c98f24ea.png';

async function main() {
  console.log('Reading source favicon...');

  // The source is white on transparent — we need to:
  // 1. Add Electric Blue tint
  // 2. Put on dark background (#09090B)
  // 3. Generate multiple sizes

  const source = sharp(SOURCE);
  const metadata = await source.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // Create a version with dark background and blue-tinted logo
  // First, tint the white to Electric Blue
  const tinted = sharp(SOURCE)
    .tint({ r: 59, g: 130, b: 246 }) // Electric Blue #3B82F6
    .png();

  const tintedBuffer = await tinted.toBuffer();

  // Create 512x512 with dark background + blue logo
  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // #09090B
    },
  })
    .composite([
      {
        input: await sharp(tintedBuffer)
          .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();

  // Save various sizes
  // favicon.png - 256x256
  await sharp(icon512).resize(256, 256).png().toFile(join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png (256x256)');

  // favicon-32x32.png  
  await sharp(icon512).resize(32, 32).png().toFile(join(publicDir, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png');

  // favicon-16x16.png
  await sharp(icon512).resize(16, 16).png().toFile(join(publicDir, 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png');

  // apple-touch-icon.png - 180x180
  await sharp(icon512).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // android-chrome-192x192.png
  await sharp(icon512).resize(192, 192).png().toFile(join(publicDir, 'android-chrome-192x192.png'));
  console.log('✓ android-chrome-192x192.png');

  // android-chrome-512x512.png
  await sharp(icon512).resize(512, 512).png().toFile(join(publicDir, 'android-chrome-512x512.png'));
  console.log('✓ android-chrome-512x512.png');

  console.log('\nAll favicons generated successfully! ✅');
}

main().catch(console.error);
