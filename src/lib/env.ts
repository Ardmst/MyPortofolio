/**
 * Central environment resolution.
 *
 * The app is designed to run in two modes:
 *  - `supabase`  → real Supabase project (URL + anon key present).
 *  - `local`     → built-in file-backed store, used while the Supabase env
 *                  values are still placeholders so the whole product
 *                  (including the admin CMS) can be exercised offline.
 *
 * Security rule: in production there are NO built-in credentials and NO
 * built-in or derived signing secret. The development defaults below only
 * exist so the CMS can be tried locally with `next dev`.
 */

import "server-only";

const PLACEHOLDER_URL = "your-project-id";
const PLACEHOLDER_KEY = "your-anon-key";

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export const isProduction = process.env.NODE_ENV === "production";

export const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const supabaseServiceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const bucket = clean(process.env.NEXT_PUBLIC_SUPABASE_BUCKET) || "portfolio-media";

/* --------------------------------------------------------------------------
 * Site URL
 *
 * NEXT_PUBLIC_APP_URL wins when it is a real address. A production build never
 * resolves to localhost: without a usable value it falls back to the live
 * domain, so canonical / Open Graph / sitemap URLs are always correct.
 * ----------------------------------------------------------------------- */

export const PRODUCTION_SITE_URL = "https://portofolio.ardmst.my.id";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

function isLoopback(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.startsWith("127.")
  );
}

function resolveSiteUrl(): string {
  const fallback = isProduction ? PRODUCTION_SITE_URL : DEVELOPMENT_SITE_URL;
  const raw = clean(process.env.NEXT_PUBLIC_APP_URL);
  if (!raw) return fallback;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;
    if (isProduction && isLoopback(parsed.hostname)) return fallback;
    return parsed.origin;
  } catch {
    return fallback;
  }
}

/** Absolute origin of the public site, without a trailing slash. */
export const siteUrl = resolveSiteUrl();

/* --------------------------------------------------------------------------
 * Data mode
 * ----------------------------------------------------------------------- */

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
 * Admin auth configuration
 *
 * Development: the values documented in `.env.example` apply when the
 * variables are unset, so `/admin` works out of the box on a laptop.
 *
 * Production: every value must be set explicitly, must not be one of the
 * documented defaults, and must be long enough. Otherwise the getters below
 * return `null` and the callers fail closed: local sign-in is refused and no
 * signed cookie is ever accepted or issued.
 * ----------------------------------------------------------------------- */

const DEV_ADMIN_EMAIL = "admin@ardmst.local";
const DEV_ADMIN_PASSWORD = "ardmst";
const DEV_SECRET_PREFIX = "ardmst-dev-secret::";

/** Every value that has ever been published in this repository. */
const DOCUMENTED_PASSWORDS = new Set([DEV_ADMIN_PASSWORD, "admin", "password", "changeme", "change-me"]);
const DOCUMENTED_SECRETS = new Set([
  "change-me-in-production-3f9a1c7b5e2d4a86",
  `${DEV_SECRET_PREFIX}${DEV_ADMIN_PASSWORD}`,
]);

export const MIN_PRODUCTION_PASSWORD_LENGTH = 12;
export const MIN_PRODUCTION_SECRET_LENGTH = 32;

export interface LocalAdminCredentials {
  email: string;
  password: string;
}

/**
 * Credentials for the local (non-Supabase) sign-in, or `null` when local
 * sign-in must be refused.
 */
export function localAdminCredentials(): LocalAdminCredentials | null {
  const email = clean(process.env.LOCAL_ADMIN_EMAIL).toLowerCase();
  const password = clean(process.env.LOCAL_ADMIN_PASSWORD);

  if (!isProduction) {
    return { email: email || DEV_ADMIN_EMAIL, password: password || DEV_ADMIN_PASSWORD };
  }

  if (!email || !password) return null;
  if (email === DEV_ADMIN_EMAIL) return null;
  if (DOCUMENTED_PASSWORDS.has(password.toLowerCase())) return null;
  if (password.length < MIN_PRODUCTION_PASSWORD_LENGTH) return null;

  return { email, password };
}

/**
 * HMAC key for the signed admin session cookie, or `null` when signed cookies
 * must be neither issued nor accepted.
 */
export function sessionSecret(): string | null {
  const explicit = clean(process.env.AUTH_SECRET);

  if (!isProduction) {
    if (explicit) return explicit;
    // Development-only derivation, so `next dev` works with an empty env.
    return `${DEV_SECRET_PREFIX}${clean(process.env.LOCAL_ADMIN_PASSWORD) || DEV_ADMIN_PASSWORD}`;
  }

  if (!explicit) return null;
  if (DOCUMENTED_SECRETS.has(explicit)) return null;
  if (explicit.startsWith(DEV_SECRET_PREFIX)) return null;
  if (explicit.length < MIN_PRODUCTION_SECRET_LENGTH) return null;

  return explicit;
}

/**
 * In Supabase mode the Supabase session is the only credential. The signed
 * cookie is accepted as a second proof of identity only when this flag is set
 * explicitly (and never in place of a configured secret).
 */
export const supabaseCookieFallback =
  clean(process.env.AUTH_COOKIE_FALLBACK).toLowerCase() === "true";

/** True when a signed session cookie may be issued/accepted in this mode. */
export function signedCookieEnabled(mode: DataMode = dataMode()): boolean {
  if (mode === "supabase" && !supabaseCookieFallback) return false;
  return sessionSecret() !== null;
}

/** True when `/api/auth/login` can succeed at all in the current setup. */
export function isAdminSignInConfigured(): boolean {
  if (dataMode() === "supabase") return true;
  return localAdminCredentials() !== null && sessionSecret() !== null;
}
