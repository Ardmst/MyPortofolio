/**
 * Central environment resolution.
 *
 * The app is designed to run in two modes:
 *  - `supabase`  → real Supabase project (URL + anon key present).
 *  - `local`     → built-in file-backed store, used while the Supabase env
 *                  values are still placeholders so the whole product
 *                  (including the admin CMS) can be exercised offline.
 */

const PLACEHOLDER_URL = "your-project-id";
const PLACEHOLDER_KEY = "your-anon-key";

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const supabaseServiceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const appUrl = clean(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
export const bucket = clean(process.env.NEXT_PUBLIC_SUPABASE_BUCKET) || "portfolio-media";

export const localAdminEmail =
  clean(process.env.LOCAL_ADMIN_EMAIL) || "admin@portototo.local";
export const localAdminPassword = clean(process.env.LOCAL_ADMIN_PASSWORD) || "portototo";

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes(PLACEHOLDER_URL)) return false;
  if (supabaseAnonKey.includes(PLACEHOLDER_KEY)) return false;

  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export type DataMode = "supabase" | "local";

export function dataMode(): DataMode {
  return isSupabaseConfigured() ? "supabase" : "local";
}

/* --------------------------------------------------------------------------
 * Warp Auth (external identity provider)
 *
 * Portototo can delegate admin sign-in to the Warp Auth service. The whole
 * integration is dormant until these values are filled in, so the local
 * fallback and Supabase Auth keep working exactly as before.
 * Contract: docs/warp-auth-integration.md
 * ----------------------------------------------------------------------- */

export const warpAuthUrl = clean(process.env.WARP_AUTH_URL).replace(/\/+$/, "");
export const warpClientId = clean(process.env.WARP_AUTH_CLIENT_ID);
export const warpClientSecret = clean(process.env.WARP_AUTH_CLIENT_SECRET);
export const warpScopes = clean(process.env.WARP_AUTH_SCOPES) || "profile email";

/** Comma-separated allowlist of Warp accounts that may reach the CMS. */
export const warpAdminEmails = clean(process.env.WARP_ADMIN_EMAILS)
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

/** Escape hatch for development: accept any Warp account as an admin. */
export const warpAllowAnyUser =
  clean(process.env.WARP_ALLOW_ANY_USER).toLowerCase() === "true";

export function isWarpConfigured(): boolean {
  if (!warpAuthUrl || !warpClientId || !warpClientSecret) return false;

  try {
    const parsed = new URL(warpAuthUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
