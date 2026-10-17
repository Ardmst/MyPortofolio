import { toVideoEmbed } from "@/lib/utils";

export function isVideoUrl(url: string): boolean {
  return toVideoEmbed(url) !== null;
}

export interface ProjectFormValues {
  title: string;
  slug: string;
  category: string;
  summary: string;
  description_markdown: string;
  tech_stack: string[];
  thumbnail_url: string;
  gallery_urls: string[];
  demo_url: string;
  github_url: string;
  featured: boolean;
}

export const MIN_SUMMARY = 10;
export const MIN_DESCRIPTION = 20;
export const MAX_SUMMARY = 600;

export function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateProjectForm(values: ProjectFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
  if (!values.slug.trim()) errors.slug = "Slug is required.";
  if (!values.category) errors.category = "Pick a category.";
  if (values.summary.trim().length < MIN_SUMMARY) {
    errors.summary = `Summary must be at least ${MIN_SUMMARY} characters.`;
  }
  if (values.summary.length > MAX_SUMMARY) {
    errors.summary = `Summary must be ${MAX_SUMMARY} characters or fewer.`;
  }
  if (values.description_markdown.trim().length < MIN_DESCRIPTION) {
    errors.description_markdown = `Description must be at least ${MIN_DESCRIPTION} characters.`;
  }
  if (values.tech_stack.length === 0) errors.tech_stack = "Add at least one technology.";
  if (!values.thumbnail_url.trim()) errors.thumbnail_url = "A thumbnail is required.";

  for (const [field, value] of [
    ["demo_url", values.demo_url],
    ["github_url", values.github_url],
  ] as const) {
    const trimmed = value.trim();
    if (trimmed && !/^https?:\/\/.+/i.test(trimmed)) {
      errors[field] = "Must be a full URL starting with https://";
    }
  }

  return errors;
}
