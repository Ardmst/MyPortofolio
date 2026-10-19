/** Domain types — mirror the Postgres schema in `supabase/migrations/01_schema.sql`. */

export const PROJECT_CATEGORIES = ["game", "web_app", "design"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const SKILL_CATEGORIES = ["programming", "game_dev", "design"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  summary: string;
  description_markdown: string;
  tech_stack: string[];
  thumbnail_url: string;
  gallery_urls: string[];
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number;
  icon_name: string | null;
  display_order: number;
}

/** Payload accepted by the create/update skill endpoints. */
export interface SkillInput {
  name: string;
  category: SkillCategory;
  proficiency: number;
  icon_name: string | null;
  display_order: number;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

/** Payload accepted by the create/update project endpoints. */
export interface ProjectInput {
  title: string;
  slug: string;
  category: ProjectCategory;
  summary: string;
  description_markdown: string;
  tech_stack: string[];
  thumbnail_url: string;
  gallery_urls: string[];
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
}

export interface MessageInput {
  sender_name: string;
  sender_email: string;
  subject: string | null;
  message: string;
}

export interface DashboardStats {
  totalProjects: number;
  byCategory: Record<ProjectCategory, number>;
  unreadMessages: number;
  totalMessages: number;
  totalSkills: number;
}
