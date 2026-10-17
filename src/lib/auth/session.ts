import { localAdminPassword } from "@/lib/env";

/**
 * Signed-cookie session used by the local fallback auth mode.
 *
 * Implemented with Web Crypto (HMAC-SHA256) so the exact same code runs in
 * both the Edge middleware and Node.js route handlers.
 */

export const SESSION_COOKIE = "pt_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();

function secret(): string {
  const explicit = (process.env.AUTH_SECRET ?? "").trim();
  if (explicit) return explicit;
  // Dev-only derivation; set AUTH_SECRET in production.
  return `portototo-dev-secret::${localAdminPassword}`;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
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

export type SessionProvider = "supabase" | "local" | "warp";

const PROVIDERS: SessionProvider[] = ["supabase", "local", "warp"];

export interface SessionPayload {
  email: string;
  /** Which backend authenticated this session. */
  provider?: SessionProvider;
  /** Display name reported by the identity provider, when available. */
  name?: string;
  /** Epoch milliseconds. */
  exp: number;
}

export async function createSessionToken(
  email: string,
  extra: { provider?: SessionProvider; name?: string } = {},
): Promise<string> {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  if (extra.provider) payload.provider = extra.provider;
  if (extra.name) payload.name = extra.name;

  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (!payload?.email || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    if (payload.provider && !PROVIDERS.includes(payload.provider)) return null;

    return payload;
  } catch {
    return null;
  }
}
