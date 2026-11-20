import { sessionSecret, signedCookieEnabled, type DataMode } from "@/lib/env";

/**
 * Signed-cookie session used by the local (non-Supabase) auth mode.
 *
 * Implemented with Web Crypto (HMAC-SHA256) so the exact same code runs in
 * the request proxy and in the Node.js route handlers.
 *
 * The key comes from `sessionSecret()`. When that returns `null` (production
 * without a real AUTH_SECRET) no token can be created and every token is
 * rejected — there is no built-in or derived key to fall back to.
 */

export const SESSION_COOKIE = "pt_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));

  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

export type SessionProvider = "supabase" | "local";

const PROVIDERS: SessionProvider[] = ["supabase", "local"];

export interface SessionPayload {
  email: string;
  /** Which backend authenticated this session. */
  provider?: SessionProvider;
  /** Display name reported by the identity provider, when available. */
  name?: string;
  /** Epoch milliseconds. */
  exp: number;
}

/** Thrown when a session cannot be issued because no signing secret exists. */
export class SessionUnavailableError extends Error {
  constructor() {
    super("Signed sessions are disabled: AUTH_SECRET is not configured.");
    this.name = "SessionUnavailableError";
  }
}

export async function createSessionToken(
  email: string,
  extra: { provider?: SessionProvider; name?: string } = {},
): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new SessionUnavailableError();

  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  if (extra.provider) payload.provider = extra.provider;
  if (extra.name) payload.name = extra.name;

  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const secret = sessionSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (!payload || typeof payload.email !== "string" || !payload.email) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.provider && !PROVIDERS.includes(payload.provider)) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * The one place that decides whether a signed cookie grants access.
 *
 *  - local mode    → the cookie is the session; it must have been issued by
 *                    the local sign-in.
 *  - supabase mode → ignored unless AUTH_COOKIE_FALLBACK=true, and then only
 *                    cookies issued by a Supabase sign-in count.
 */
export async function readSessionCookie(
  token: string | undefined | null,
  mode: DataMode,
): Promise<SessionPayload | null> {
  if (!signedCookieEnabled(mode)) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;
  if ((session.provider ?? "local") !== mode) return null;

  return session;
}
