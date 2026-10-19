import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL/id safe slug. Falls back to a short timestamp suffix when empty. */
export function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || `project-${Date.now().toString(36)}`;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function relativeTime(value: string): string {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return "-";

  const diff = Date.now() - date;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
}

/**
 * Detects whether a gallery URL should render as an inline video player
 * (YouTube embed, or a direct mp4/webm/mov asset).
 */
export function toVideoEmbed(url: string): { kind: "youtube"; src: string } | { kind: "file"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtube = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtube) {
    return { kind: "youtube", src: `https://www.youtube.com/embed/${youtube[1]}` };
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { kind: "file", src: trimmed };
  }

  return null;
}

/**
 * Single source of truth for "how many messages have not been read".
 * Every surface (dashboard stat card, inbox header, inbox table) derives
 * from this helper so the counts can never diverge.
 */
export function countUnread(messages: { is_read: boolean }[]): number {
  return messages.filter((message) => !message.is_read).length;
}

export function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
