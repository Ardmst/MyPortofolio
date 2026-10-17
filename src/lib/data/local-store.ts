import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_MESSAGES, SEED_PROJECTS, SEED_SKILLS } from "@/lib/data/seed";
import type { Message, Project, Skill } from "@/lib/types";

/**
 * File-backed fallback store used while Supabase is not configured.
 * Persists to `.local-data/db.json` so CRUD survives dev-server restarts.
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

/** Serialises writes so concurrent requests cannot interleave. */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation, operation);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readDatabase(): Promise<LocalDatabase> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDatabase>;
    return {
      projects: parsed.projects ?? [],
      skills: parsed.skills ?? [],
      messages: parsed.messages ?? [],
    };
  } catch {
    // First run (or a corrupted file) — materialise the seed data.
    const seeded = freshDatabase();
    await persist(seeded);
    return seeded;
  }
}

async function persist(db: LocalDatabase): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

/** Read + mutate + persist, atomically with respect to other requests. */
export async function withDatabase<T>(mutator: (db: LocalDatabase) => T | Promise<T>): Promise<T> {
  return enqueue(async () => {
    const db = await readDatabase();
    const result = await mutator(db);
    await persist(db);
    return result;
  });
}

export async function readOnly<T>(reader: (db: LocalDatabase) => T | Promise<T>): Promise<T> {
  const db = await readDatabase();
  return reader(db);
}

export function newId(): string {
  return crypto.randomUUID();
}

/**
 * Local-fallback upload storage.
 *
 * Files live outside `public/` on purpose: `next start` only serves `public/`
 * as it existed at build time, so anything written at runtime would 404.
 * They are streamed back through the `/uploads/[...path]` route handler
 * instead, which behaves identically in `next dev` and `next start`.
 */
export const LOCAL_UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const LOCAL_UPLOAD_URL_PREFIX = "/uploads";
