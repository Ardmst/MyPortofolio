import "server-only";
import {
  appUrl,
  isWarpConfigured,
  warpAdminEmails,
  warpAllowAnyUser,
  warpAuthUrl,
  warpClientId,
  warpClientSecret,
  warpScopes,
} from "@/lib/env";

/**
 * Warp Auth integration — Ardmst delegates admin sign-in to the Warp Auth
 * service instead of holding its own passwords.
 *
 * The flow is a plain OAuth 2.0 authorization-code redirect hardened with PKCE:
 *
 *   1. GET /api/auth/warp/start     → 302 to {WARP_AUTH_URL}/authorize
 *   2. GET /api/auth/warp/callback  → POST {WARP_AUTH_URL}/token  (code → token)
 *                                   → GET  {WARP_AUTH_URL}/userinfo (identity)
 *   3. Ardmst mints its own signed cookie and the middleware gate passes.
 *
 * The response parsers below are deliberately tolerant of field-name variants
 * (`access_token` / `accessToken` / `token`, `email` / `email_address`, …) so
 * the adapter keeps working if the Warp service renames a field. See
 * docs/warp-auth-integration.md for the exact contract that is expected.
 */

export const WARP_STATE_COOKIE = "pt_warp_state";
export const WARP_VERIFIER_COOKIE = "pt_warp_verifier";
export const WARP_RETURN_COOKIE = "pt_warp_return";
export const WARP_FLOW_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export const WARP_REDIRECT_PATH = "/api/auth/warp/callback";

/** Human-readable messages for the `?warp=` flag on the login page. */
export const WARP_ERROR_MESSAGES: Record<string, string> = {
  unconfigured:
    "Warp Auth is not configured yet. Set WARP_AUTH_URL, WARP_AUTH_CLIENT_ID and WARP_AUTH_CLIENT_SECRET in .env.local.",
  state: "The sign-in request expired or was tampered with. Please try again.",
  cancelled: "Sign-in was cancelled at Warp Auth.",
  exchange: "Warp Auth rejected the authorization code.",
  profile: "Warp Auth did not return an account profile.",
  denied:
    "That Warp account is not on the CMS allowlist. Add it to WARP_ADMIN_EMAILS.",
  network: "Could not reach the Warp Auth service.",
};

export function warpErrorFromSearchParam(value: string | undefined): string | null {
  if (!value) return null;
  return WARP_ERROR_MESSAGES[value] ?? "Warp sign-in failed. Please try again.";
}

function callbackUrl(): string {
  return new URL(WARP_REDIRECT_PATH, appUrl).toString();
}

/* ------------------------------------------------------------------ PKCE -- */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toBase64Url(buffer);
}

export async function codeChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return toBase64Url(new Uint8Array(digest));
}

/* --------------------------------------------------------------- requests */

export interface WarpAuthRequest {
  url: string;
  state: string;
  verifier: string;
}

/** Builds the authorize redirect the browser is sent to. */
export async function createWarpAuthRequest(): Promise<WarpAuthRequest> {
  const state = randomToken(24);
  const verifier = randomToken(48);

  const url = new URL(`${warpAuthUrl}/authorize`);
  url.searchParams.set("client_id", warpClientId);
  url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", warpScopes);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", await codeChallengeFor(verifier));
  url.searchParams.set("code_challenge_method", "S256");

  return { url: url.toString(), state, verifier };
}

/* ------------------------------------------------------------- responses */

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null;
}

function firstString(source: Json, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

/** Reads the access token out of whichever envelope the service replied with. */
export function readAccessToken(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) return null;

  const nested = asRecord(root.data) ?? asRecord(root.token);
  const candidates = [root, nested].filter((value): value is Json => Boolean(value));

  for (const source of candidates) {
    const token = firstString(source, ["access_token", "accessToken", "token", "token_value"]);
    if (token) return token;
  }
  return null;
}

export interface WarpIdentity {
  email: string;
  name?: string;
  username?: string;
  /** Raw provider payload, kept for debugging/auditing. */
  raw: Json;
}

/** Normalises the userinfo payload into the fields Ardmst cares about. */
export function readIdentity(payload: unknown): WarpIdentity | null {
  const root = asRecord(payload);
  if (!root) return null;

  const source =
    asRecord(root.data) ?? asRecord(root.user) ?? asRecord(root.profile) ?? root;

  const email = firstString(source, ["email", "email_address", "mail", "emailAddress"]);
  if (!email) return null;

  return {
    email: email.toLowerCase(),
    name: firstString(source, ["name", "full_name", "fullName", "display_name", "displayName"]),
    username: firstString(source, ["username", "handle", "nickname", "preferred_username"]),
    raw: root,
  };
}

/* -------------------------------------------------------------- allowlist */

/**
 * Decides whether a Warp account may reach the CMS.
 *
 * Deny-by-default: an account is admitted only when it is explicitly listed in
 * `WARP_ADMIN_EMAILS`, carries an admin-ish role, or the deployment opted into
 * `WARP_ALLOW_ANY_USER=true`.
 */
export function isWarpAdmin(identity: WarpIdentity): boolean {
  if (warpAdminEmails.includes(identity.email)) return true;

  const source = asRecord((identity.raw.data ?? identity.raw.user) as unknown) ?? identity.raw;

  if (source.is_admin === true || source.isAdmin === true || source.is_superuser === true) {
    return true;
  }

  const role = firstString(source, ["role", "user_type", "userType"])?.toLowerCase();
  if (role && ["admin", "owner", "superuser", "root"].includes(role)) return true;

  const roles = source.roles;
  if (Array.isArray(roles)) {
    const normalised = roles.map((value) => String(value).toLowerCase());
    if (normalised.some((value) => ["admin", "owner", "superuser", "root"].includes(value))) {
      return true;
    }
  }

  return warpAllowAnyUser;
}

/* --------------------------------------------------------------- network */

export class WarpError extends Error {
  constructor(
    /** Short code used to build the `?warp=` redirect flag. */
    readonly code: keyof typeof WARP_ERROR_MESSAGES,
    message: string,
  ) {
    super(message);
    this.name = "WarpError";
  }
}

const TIMEOUT_MS = 10_000;

async function requestJson(url: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new WarpError("network", `Could not reach ${url}.`);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new WarpError("exchange", `Warp Auth responded ${response.status}: ${text.slice(0, 200)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    // Some services post back `access_token=...&...` form encoding.
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }
}

/** Step 2a — exchanges the authorization code for an access token. */
export async function exchangeWarpCode(code: string, verifier: string): Promise<string> {
  const payload = await requestJson(`${warpAuthUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(),
      client_id: warpClientId,
      client_secret: warpClientSecret,
      code_verifier: verifier,
    }),
  });

  const token = readAccessToken(payload);
  if (!token) throw new WarpError("exchange", "Warp Auth returned no access token.");

  return token;
}

/** Step 2b — reads the identity behind that token. */
export async function fetchWarpIdentity(accessToken: string): Promise<WarpIdentity> {
  const payload = await requestJson(`${warpAuthUrl}/userinfo`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  });

  const identity = readIdentity(payload);
  if (!identity) throw new WarpError("profile", "Warp Auth returned no account profile.");

  return identity;
}

export { isWarpConfigured };
