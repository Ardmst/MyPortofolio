import type { NextConfig } from "next";

/**
 * Supabase Storage public object URLs look like:
 *   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<file>
 * We derive the remote pattern from NEXT_PUBLIC_SUPABASE_URL so the same
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
  // Required by the Azure VPS / PM2 deployment plan (PRD 8.3): produces
  // .next/standalone with a self-contained server.js.
  output: "standalone",
  images: {
    // The design system ships hand-authored SVG artwork (profile frame,
    // placeholder thumbnails). They are served first-party, and the optimizer
    // is locked down with an attachment disposition + strict CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Wildcard fallback for projects whose gallery lives on another CDN.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
