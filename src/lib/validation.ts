import {
  PROJECT_CATEGORIES,
  SKILL_CATEGORIES,
  type ProjectCategory,
  type ProjectInput,
  type SkillCategory,
  type SkillInput,
} from "@/lib/types";
import { isEmail, isUuid, slugify } from "@/lib/utils";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function optionalUrl(value: unknown, field: string, errors: Record<string, string>): string | null {
  const raw = asString(value).trim();
  if (!raw) return null;
  if (!/^https?:\/\/.+/i.test(raw) && !raw.startsWith("/")) {
    errors[field] = "Must be a full URL (https://…) or a site-relative path (/…).";
    return null;
  }
  return raw;
}

export function validateProject(payload: unknown): ValidationResult<ProjectInput> {
  const errors: Record<string, string> = {};
  const body = (payload ?? {}) as Record<string, unknown>;

  const title = asString(body.title).trim();
  if (title.length < 3) errors.title = "Title must be at least 3 characters.";
  if (title.length > 255) errors.title = "Title must be 255 characters or fewer.";

  const slug = slugify(asString(body.slug).trim() || title);
  if (slug.length > 255) errors.slug = "Slug must be 255 characters or fewer.";

  const category = asString(body.category).trim() as ProjectCategory;
  if (!PROJECT_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${PROJECT_CATEGORIES.join(", ")}.`;
  }

  const summary = asString(body.summary).trim();
  if (summary.length < 10) errors.summary = "Summary must be at least 10 characters.";
  if (summary.length > 600) errors.summary = "Summary must be 600 characters or fewer.";

  const description_markdown = asString(body.description_markdown).trim();
  if (description_markdown.length < 20) {
    errors.description_markdown = "Description must be at least 20 characters.";
  }

  const tech_stack = asStringArray(body.tech_stack);
  if (tech_stack.length === 0) errors.tech_stack = "Add at least one technology.";

  const thumbnail_url = asString(body.thumbnail_url).trim();
  if (!thumbnail_url) {
    errors.thumbnail_url = "A thumbnail is required.";
  } else if (!/^https?:\/\/.+/i.test(thumbnail_url) && !thumbnail_url.startsWith("/")) {
    errors.thumbnail_url = "Thumbnail must be a full URL or a site-relative path.";
  }

  const demo_url = optionalUrl(body.demo_url, "demo_url", errors);
  const github_url = optionalUrl(body.github_url, "github_url", errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      slug,
      category,
      summary,
      description_markdown,
      tech_stack,
      thumbnail_url,
      gallery_urls: asStringArray(body.gallery_urls),
      demo_url,
      github_url,
      featured: Boolean(body.featured),
    },
  };
}

export interface ValidatedMessage {
  sender_name: string;
  sender_email: string;
  subject: string | null;
  message: string;
}

export function validateMessage(payload: unknown): ValidationResult<ValidatedMessage> {
  const errors: Record<string, string> = {};
  const body = (payload ?? {}) as Record<string, unknown>;

  const sender_name = asString(body.sender_name).trim();
  if (sender_name.length < 2) errors.sender_name = "Name must be at least 2 characters.";
  if (sender_name.length > 100) errors.sender_name = "Name must be 100 characters or fewer.";

  const sender_email = asString(body.sender_email).trim();
  if (!isEmail(sender_email)) errors.sender_email = "Enter a valid email address.";
  if (sender_email.length > 150) errors.sender_email = "Email must be 150 characters or fewer.";

  const subject = asString(body.subject).trim();
  if (subject.length > 200) errors.subject = "Subject must be 200 characters or fewer.";

  const message = asString(body.message).trim();
  if (message.length < 10) errors.message = "Message must be at least 10 characters.";
  if (message.length > 5000) errors.message = "Message must be 5000 characters or fewer.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { sender_name, sender_email, subject: subject || null, message },
  };
}

/** Validates a skill payload. Proficiency is strictly an integer 1–100. */
export function validateSkill(payload: unknown): ValidationResult<SkillInput> {
  const errors: Record<string, string> = {};
  const body = (payload ?? {}) as Record<string, unknown>;

  const name = asString(body.name).trim();
  if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  const category = asString(body.category).trim() as SkillCategory;
  if (!SKILL_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${SKILL_CATEGORIES.join(", ")}.`;
  }

  const rawProficiency = body.proficiency;
  const proficiency =
    typeof rawProficiency === "number"
      ? Math.round(rawProficiency)
      : Number.isFinite(Number(rawProficiency)) && asString(rawProficiency).trim() !== ""
        ? Math.round(Number(rawProficiency))
        : Number.NaN;

  if (!Number.isInteger(proficiency) || proficiency < 1 || proficiency > 100) {
    errors.proficiency = "Proficiency must be an integer between 1 and 100.";
  }

  const icon_name = asString(body.icon_name).trim();
  if (icon_name.length > 50) errors.icon_name = "Icon name must be 50 characters or fewer.";

  const rawOrder = body.display_order ?? 0;
  const display_order =
    typeof rawOrder === "number"
      ? Math.round(rawOrder)
      : Number.isFinite(Number(rawOrder)) && asString(rawOrder).trim() !== ""
        ? Math.round(Number(rawOrder))
        : Number.NaN;

  if (!Number.isInteger(display_order) || display_order < 0) {
    errors.display_order = "Display order must be a non-negative integer.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, category, proficiency, icon_name: icon_name || null, display_order },
  };
}

export function normalizeIdentifier(value: string): string | null {
  const raw = decodeURIComponent(value ?? "").trim();
  if (!raw || raw.length > 255) return null;
  if (isUuid(raw)) return raw;
  return /^[a-z0-9-]+$/i.test(raw) ? raw : null;
}
