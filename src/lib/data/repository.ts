import { promises as fs } from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { bucket, dataMode } from "@/lib/env";
import {
  LOCAL_UPLOAD_DIR,
  LOCAL_UPLOAD_URL_PREFIX,
  newId,
  readOnly,
  withDatabase,
} from "@/lib/data/local-store";
import type {
  DashboardStats,
  Message,
  MessageInput,
  Project,
  ProjectCategory,
  ProjectInput,
  Skill,
} from "@/lib/types";

/**
 * Single data-access layer for the whole app.
 *
 * Every function transparently runs against either Supabase or the local
 * file store, depending on `dataMode()`. Callers never need to know which.
 */

export class RepositoryError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "RepositoryError";
    this.status = status;
  }
}

function fail(error: unknown, fallback: string): never {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : fallback;

  // Surface the common Supabase/Postgres mistakes as actionable messages.
  if (message.includes("duplicate key") && message.includes("slug")) {
    throw new RepositoryError("A project with that slug already exists.", 409);
  }
  if (message.includes("Bucket not found")) {
    throw new RepositoryError(
      `Storage bucket "${bucket}" was not found. Run supabase/storage.sql first.`,
      500,
    );
  }
  if (message.includes("relation") && message.includes("does not exist")) {
    throw new RepositoryError(
      "Database tables are missing. Run supabase/migrations/01_schema.sql first.",
      500,
    );
  }

  throw new RepositoryError(message || fallback, 500);
}

/**
 * Prefer the service-role client (bypasses RLS for admin writes). Falls back
 * to the cookie-bound anon client so the app still works when the service
 * role key has not been provided.
 */
async function db(): Promise<SupabaseClient> {
  const admin = createServiceRoleClient();
  if (admin) return admin;
  return createServerSupabaseClient();
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function listProjects(options?: {
  category?: ProjectCategory | "all";
}): Promise<Project[]> {
  const category = options?.category;

  if (dataMode() === "local") {
    return readOnly((store) =>
      sortProjects(
        store.projects.filter((project) => !category || category === "all" || project.category === category),
      ),
    );
  }

  try {
    const supabase = await db();
    let query = supabase.from("projects").select("*");
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return sortProjects((data ?? []) as Project[]);
  } catch (error) {
    fail(error, "Failed to load projects.");
  }
}

export async function getProject(slugOrId: string): Promise<Project | null> {
  const key = slugOrId.trim();
  if (!key) return null;

  if (dataMode() === "local") {
    return readOnly(
      (store) => store.projects.find((project) => project.slug === key || project.id === key) ?? null,
    );
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .or(`slug.eq.${key},id.eq.${key}`)
      .maybeSingle();

    if (error) throw error;
    return (data as Project | null) ?? null;
  } catch (error) {
    fail(error, "Failed to load the project.");
  }
}

function normalizeProject(input: ProjectInput): ProjectInput {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    category: input.category,
    summary: input.summary.trim(),
    description_markdown: input.description_markdown.trim(),
    tech_stack: input.tech_stack.map((item) => item.trim()).filter(Boolean),
    thumbnail_url: input.thumbnail_url.trim(),
    gallery_urls: input.gallery_urls.map((item) => item.trim()).filter(Boolean),
    demo_url: input.demo_url?.trim() || null,
    github_url: input.github_url?.trim() || null,
    featured: Boolean(input.featured),
  };
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const payload = normalizeProject(input);

  if (dataMode() === "local") {
    return withDatabase((store) => {
      if (store.projects.some((project) => project.slug === payload.slug)) {
        throw new RepositoryError("A project with that slug already exists.", 409);
      }

      const timestamp = new Date().toISOString();
      const project: Project = {
        id: newId(),
        ...payload,
        created_at: timestamp,
        updated_at: timestamp,
      };
      store.projects.unshift(project);
      return project;
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase.from("projects").insert(payload).select("*").single();
    if (error) throw error;
    return data as Project;
  } catch (error) {
    fail(error, "Failed to create the project.");
  }
}

export async function updateProject(slugOrId: string, input: ProjectInput): Promise<Project> {
  const payload = normalizeProject(input);
  const key = slugOrId.trim();

  if (dataMode() === "local") {
    return withDatabase((store) => {
      const index = store.projects.findIndex(
        (project) => project.id === key || project.slug === key,
      );
      if (index === -1) throw new RepositoryError("Project not found.", 404);

      if (store.projects.some((project, i) => i !== index && project.slug === payload.slug)) {
        throw new RepositoryError("A project with that slug already exists.", 409);
      }

      const updated: Project = {
        ...store.projects[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      store.projects[index] = updated;
      return updated;
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .or(`slug.eq.${key},id.eq.${key}`)
      .select("*")
      .single();

    if (error) throw error;
    return data as Project;
  } catch (error) {
    fail(error, "Failed to update the project.");
  }
}

export async function deleteProject(slugOrId: string): Promise<{ id: string; title: string }> {
  const key = slugOrId.trim();

  if (dataMode() === "local") {
    return withDatabase((store) => {
      const index = store.projects.findIndex(
        (project) => project.id === key || project.slug === key,
      );
      if (index === -1) throw new RepositoryError("Project not found.", 404);

      const [removed] = store.projects.splice(index, 1);
      return { id: removed.id, title: removed.title };
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .or(`slug.eq.${key},id.eq.${key}`)
      .select("id, title")
      .single();

    if (error) throw error;
    return data as { id: string; title: string };
  } catch (error) {
    fail(error, "Failed to delete the project.");
  }
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export async function listSkills(): Promise<Skill[]> {
  if (dataMode() === "local") {
    return readOnly((store) =>
      [...store.skills].sort((a, b) => a.display_order - b.display_order),
    );
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Skill[];
  } catch (error) {
    fail(error, "Failed to load skills.");
  }
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                    */
/* -------------------------------------------------------------------------- */

export async function createMessage(input: MessageInput): Promise<Message> {
  const payload = {
    sender_name: input.sender_name.trim(),
    sender_email: input.sender_email.trim().toLowerCase(),
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  };

  if (dataMode() === "local") {
    return withDatabase((store) => {
      const message: Message = {
        id: newId(),
        ...payload,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      store.messages.unshift(message);
      return message;
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase.from("messages").insert(payload).select("*").single();
    if (error) throw error;
    return data as Message;
  } catch (error) {
    fail(error, "Failed to send the message.");
  }
}

export async function listMessages(): Promise<Message[]> {
  if (dataMode() === "local") {
    return readOnly((store) =>
      [...store.messages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    );
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Message[];
  } catch (error) {
    fail(error, "Failed to load messages.");
  }
}

export async function setMessageRead(id: string, isRead: boolean): Promise<Message> {
  if (dataMode() === "local") {
    return withDatabase((store) => {
      const index = store.messages.findIndex((message) => message.id === id);
      if (index === -1) throw new RepositoryError("Message not found.", 404);
      store.messages[index] = { ...store.messages[index], is_read: isRead };
      return store.messages[index];
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: isRead })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Message;
  } catch (error) {
    fail(error, "Failed to update the message.");
  }
}

export async function deleteMessage(id: string): Promise<{ id: string }> {
  if (dataMode() === "local") {
    return withDatabase((store) => {
      const index = store.messages.findIndex((message) => message.id === id);
      if (index === -1) throw new RepositoryError("Message not found.", 404);
      store.messages.splice(index, 1);
      return { id };
    });
  }

  try {
    const supabase = await db();
    const { data, error } = await supabase.from("messages").delete().eq("id", id).select("id").single();
    if (error) throw error;
    return data as { id: string };
  } catch (error) {
    fail(error, "Failed to delete the message.");
  }
}

/* -------------------------------------------------------------------------- */
/* Uploads                                                                     */
/* -------------------------------------------------------------------------- */

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

/**
 * Uploads a media file and returns its public URL.
 * Supabase mode → Storage bucket. Local mode → `public/uploads`.
 */
export async function uploadMedia(file: File): Promise<{ url: string; path: string }> {
  if (!file || file.size === 0) {
    throw new RepositoryError("No file was provided.", 400);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new RepositoryError("File is larger than the 10 MB limit.", 413);
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new RepositoryError(
      "Unsupported file type. Allowed: PNG, JPEG, WEBP, GIF, SVG, AVIF, MP4, WEBM, MOV.",
      415,
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeName}`;

  if (dataMode() === "local") {
    const target = path.join(LOCAL_UPLOAD_DIR, objectPath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
    return { url: `${LOCAL_UPLOAD_URL_PREFIX}/${objectPath}`, path: objectPath };
  }

  try {
    const supabase = await db();
    const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return { url: data.publicUrl, path: objectPath };
  } catch (error) {
    fail(error, "Failed to upload the file.");
  }
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  const [projects, messages, skills] = await Promise.all([
    listProjects(),
    listMessages(),
    listSkills(),
  ]);

  const byCategory = { game: 0, web_app: 0, design: 0 } as Record<ProjectCategory, number>;
  for (const project of projects) {
    if (project.category in byCategory) byCategory[project.category] += 1;
  }

  return {
    totalProjects: projects.length,
    byCategory,
    unreadMessages: messages.filter((message) => !message.is_read).length,
    totalMessages: messages.length,
    totalSkills: skills.length,
  };
}
