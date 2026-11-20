import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { RepositoryError } from "@/lib/data/errors";
import { SEED_MESSAGES, SEED_PROJECTS, SEED_SKILLS } from "@/lib/data/seed";
import type { Message, Project, Skill } from "@/lib/types";

/**
 * File-backed store used while Supabase is not configured.
 *
 * Reading never writes. When `.local-data/db.json` does not exist — a fresh
 * checkout, or a read-only deployment such as Vercel — every read is served
 * from the seed in memory. The file is only created by the first successful
 * write, and a write that cannot reach the disk fails with a clean
 * `RepositoryError` (503) instead of a raw filesystem error.
 *
 * Server-only — never import this from a client component.
 */

const DATA_DIR = path.join(process.cwd(), ".local-data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

export interface LocalDatabase {
  projects: Project[];
  skills: Skill[];
  messages: Message[];
}

function freshDatabase(): LocalDatabase {
  return {
    projects: structuredClone(SEED_PROJECTS),
    skills: structuredClone(SEED_SKILLS),
    messages: structuredClone(SEED_MESSAGES),
  };
}

function errorCode(error: unknown): string {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
}

/** Serialises writes so concurrent requests cannot interleave. */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation, operation);
  writeQueue = run.catch(() => undefined);
  return run;
}

type ReadResult = { db: LocalDatabase; source: "file" | "seed" | "corrupt" };

/** Loads the database. Never touches the disk for anything but reading. */
async function readDatabase(): Promise<ReadResult> {
  let raw: string;
  try {
    raw = await fs.readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (errorCode(error) !== "ENOENT") {
      console.warn("[local-store] data file is unreadable, serving the seed:", errorCode(error) || error);
    }
    return { db: freshDatabase(), source: "seed" };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDatabase> | null;
    if (!parsed || typeof parsed !== "object") throw new Error("not an object");
    return {
      db: {
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      },
      source: "file",
    };
  } catch {
    console.warn("[local-store] data file is not valid JSON, serving the seed.");
    return { db: freshDatabase(), source: "corrupt" };
  }
}

function writeFailure(error: unknown): RepositoryError {
  console.error("[local-store] write failed:", errorCode(error) || error);
  return new RepositoryError(
    "Content is read-only on this deployment, so the change was not saved.",
    503,
  );
}

async function persist(db: LocalDatabase, previous: ReadResult["source"]): Promise<void> {
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    if (previous === "corrupt") {
      // Keep the unreadable file for inspection instead of silently replacing it.
      await fs.rename(DATA_FILE, `${DATA_FILE}.corrupt-${Date.now()}`).catch(() => undefined);
    }
    // Write-then-rename, so a crash can never leave a half-written database.
    await fs.writeFile(temporary, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(temporary, DATA_FILE);
  } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => undefined);
    throw writeFailure(error);
  }
}

/** Read + mutate + persist, atomically with respect to other requests. */
export async function withDatabase<T>(mutator: (db: LocalDatabase) => T | Promise<T>): Promise<T> {
  return enqueue(async () => {
    const { db, source } = await readDatabase();
    const result = await mutator(db);
    await persist(db, source);
    return result;
  });
}

export async function readOnly<T>(reader: (db: LocalDatabase) => T | Promise<T>): Promise<T> {
  const { db } = await readDatabase();
  return reader(db);
}

export function newId(): string {
  return crypto.randomUUID();
}

/**
 * Local upload storage.
 *
 * Files live outside `public/` on purpose: `next start` only serves `public/`
 * as it existed at build time, so anything written at runtime would 404.
 * They are streamed back through the `/uploads/[...path]` route handler
 * instead, which behaves identically in `next dev` and `next start`.
 */
export const LOCAL_UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const LOCAL_UPLOAD_URL_PREFIX = "/uploads";

/** Stores one uploaded file on disk; fails cleanly when the disk is read-only. */
export async function writeLocalUpload(objectPath: string, bytes: Uint8Array): Promise<void> {
  const target = path.join(LOCAL_UPLOAD_DIR, objectPath);
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  } catch (error) {
    console.error("[local-store] upload failed:", errorCode(error) || error);
    throw new RepositoryError(
      "Uploads are not available on this deployment. Connect Supabase Storage to enable them.",
      503,
    );
  }
}
