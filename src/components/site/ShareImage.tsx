import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

/**
 * The picture a shared link shows (Open Graph and Twitter), drawn in the theme:
 * the white dot-grid sheet, ARDMST in Bebas Neue as wide as the sheet, one line
 * of text, and the biro resting on the paper with the dots awake around it.
 *
 * It is generated once, at build time (`opengraph-image.tsx` / `twitter-image.tsx`
 * are static routes), from the same two typefaces the pages use. Their files
 * come from the `@fontsource` packages, as WOFF: the renderer does not read WOFF2.
 * Colours are the light values of `src/styles/theme.css`; a picture cannot read
 * the stylesheet, so they are repeated here.
 */

export const SHARE_SIZE = { width: 1200, height: 630 } as const;
export const SHARE_ALT = `ARDMST, the handle of ${SITE.fullName}, in tall black capitals on a white dot-grid sheet. Under it: ${SITE.fullName} builds web apps and games in Indonesia.`;

const INK = "#1f1f1f";
const ACCENT = "#0b57d0";
const BLOOM = ["#4285f4", "#8ab4f8", "#c2d7fb"] as const;
const DOT = "rgba(31, 31, 31, 0.2)";

const MARGIN = 48;
const PITCH = 28;
const REACH = 150;
/** Where the biro rests: under the last letters, clear of the line of text. */
const PEN = { x: 1078, y: 452 };

interface Dot {
  x: number;
  y: number;
  r: number;
  fill: string;
}

/** The sheet's dots, with the ones near the pen awake exactly as the sheet kit wakes them. */
function sheet(): Dot[] {
  const dots: Dot[] = [];
  for (let y = PITCH / 2; y < SHARE_SIZE.height; y += PITCH) {
    for (let x = PITCH / 2; x < SHARE_SIZE.width; x += PITCH) {
      const dx = x - PEN.x;
      const dy = y - PEN.y;
      const distance = Math.hypot(dx, dy);
      const energy = Math.max(0, 1 - distance / REACH);
      if (energy < 0.05) {
        dots.push({ x, y, r: 1.3, fill: DOT });
        continue;
      }
      const push = (6 * energy ** 3) / (distance || 1);
      dots.push({
        x: x + dx * push,
        y: y + dy * push,
        r: 1.3 + 3 * energy ** 2,
        fill: energy >= 0.66 ? BLOOM[0] : energy >= 0.33 ? BLOOM[1] : BLOOM[2],
      });
    }
  }
  return dots;
}

const font = (file: string) => readFile(join(process.cwd(), "node_modules/@fontsource", file));

export async function shareImage(): Promise<ImageResponse> {
  const [display, text] = await Promise.all([
    font("bebas-neue/files/bebas-neue-latin-400-normal.woff"),
    font("eb-garamond/files/eb-garamond-latin-400-normal.woff"),
  ]);

  // ARDMST is 2.3em wide in Bebas Neue at this tracking: this size fills the sheet between its margins.
  const nameSize = Math.floor((SHARE_SIZE.width - 2 * MARGIN) / 2.3);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: INK,
        }}
      >
        <svg
          width={SHARE_SIZE.width}
          height={SHARE_SIZE.height}
          viewBox={`0 0 ${SHARE_SIZE.width} ${SHARE_SIZE.height}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {sheet().map((dot) => (
            <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r} fill={dot.fill} />
          ))}
        </svg>

        <div
          style={{
            position: "absolute",
            top: 36,
            left: MARGIN - 4,
            display: "flex",
            fontFamily: "Bebas Neue",
            fontSize: nameSize,
            lineHeight: 0.8,
            letterSpacing: "-0.035em",
          }}
        >
          {SITE.handle.toUpperCase()}
        </div>

        <div
          style={{
            position: "absolute",
            left: MARGIN,
            bottom: 50,
            display: "flex",
            fontFamily: "EB Garamond",
            fontSize: 40,
            lineHeight: 1.2,
          }}
        >
          {`${SITE.fullName} builds web apps and games in Indonesia.`}
        </div>

        {/* The biro: one blue point, parked beside where the pointer would be. */}
        <div
          style={{
            position: "absolute",
            left: PEN.x + 14 - 7,
            top: PEN.y + 16 - 7,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: ACCENT,
          }}
        />
      </div>
    ),
    {
      ...SHARE_SIZE,
      fonts: [
        { name: "Bebas Neue", data: display, style: "normal", weight: 400 },
        { name: "EB Garamond", data: text, style: "normal", weight: 400 },
      ],
    },
  );
}
