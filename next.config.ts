import type { NextConfig } from "next";

/**
 * Supabase Storage public object URLs look like:
 *   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<file>
 * The remote pattern is derived from NEXT_PUBLIC_SUPABASE_URL so the same
 * config works for every environment without editing this file.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHostname: string | null = null;

try {
  if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
    supabaseHostname = new URL(supabaseUrl).hostname;
  }
} catch {
  supabaseHostname = null;
}

const nextConfig: NextConfig = {
  images: {
    // The optimizer only ever fetches from this project's own Supabase bucket.
    // No wildcard host (that would turn /_next/image into an open proxy) and no
    // SVG optimisation: first-party pictures are WebP/JPEG/PNG in `public/`.
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },

  async headers() {
    return [
      {
        // The Godot web build of Detektif Ekosistem (public/games/detektif/).
        // About 75 MB that only changes when the game is re-exported, so let
        // browsers keep it for a week. It is single-threaded: it needs no
        // COOP/COEP headers, and adding them would break the page embedding it.
        source: "/games/detektif/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
          // The bare engine shell is not a page of its own; /play/detektif is.
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
