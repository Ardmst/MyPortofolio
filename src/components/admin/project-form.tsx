"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/portfolio/markdown";
import { MediaManager } from "@/components/admin/media-manager";
import { TechStackInput } from "@/components/admin/tech-stack-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MAX_SUMMARY,
  MIN_DESCRIPTION,
  slugifyClient,
  validateProjectForm,
  type ProjectFormValues,
} from "@/lib/admin-utils";
import { GALLERY_FILTERS } from "@/lib/constants";
import type { Project } from "@/lib/types";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
}

const BLANK: ProjectFormValues = {
  title: "",
  slug: "",
  category: "",
  summary: "",
  description_markdown: "",
  tech_stack: [],
  thumbnail_url: "",
  gallery_urls: [],
  demo_url: "",
  github_url: "",
  featured: false,
};

const MARKDOWN_STARTER = `## Overview
What is this project and who is it for?

### What I built
- Feature one
- Feature two

### Hardest problem
Describe the trickiest technical or design decision.`;

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const router = useRouter();

  const initial = useMemo<ProjectFormValues>(
    () =>
      project
        ? {
            title: project.title,
            slug: project.slug,
            category: project.category,
            summary: project.summary,
            description_markdown: project.description_markdown,
            tech_stack: project.tech_stack ?? [],
            thumbnail_url: project.thumbnail_url,
            gallery_urls: project.gallery_urls ?? [],
            demo_url: project.demo_url ?? "",
            github_url: project.github_url ?? "",
            featured: project.featured,
          }
        : BLANK,
    [project],
  );

  const [values, setValues] = useState<ProjectFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugLocked, setSlugLocked] = useState(mode === "edit");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateProjectForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = mode === "create" ? "/api/projects" : `/api/projects/${project!.id}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          slug: values.slug.trim(),
          demo_url: values.demo_url.trim() || null,
          github_url: values.github_url.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        toast.error(payload.error ?? "Save failed.");
        return;
      }

      toast.success(mode === "create" ? "Project created" : "Project updated", {
        description: `${values.title.trim()} is live on the gallery.`,
      });
      router.push("/admin/projects");
      router.refresh();
    } catch {
      toast.error("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  const gallery = values.gallery_urls;
  const galleryCount = (values.thumbnail_url ? 1 : 0) + gallery.length;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-subtle transition-colors hover:text-accent-soft"
          >
            <ArrowLeft className="size-3" />
            back to projects
          </Link>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {mode === "create" ? "New Project" : `Edit — ${project?.title}`}
          </h1>
          <p className="text-sm text-fg-muted">
            {mode === "create"
              ? "Publish a new entry to the public gallery."
              : "Changes go live as soon as you save."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{galleryCount} media</Badge>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : mode === "create" ? "Create Project" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Main column */}
        <div className="space-y-5">
          <Panel title="Identity">
            <Field label="Title" error={errors.title} htmlFor="title">
              <Input
                id="title"
                value={values.title}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((current) => ({
                    ...current,
                    title: next,
                    slug: slugLocked ? current.slug : slugifyClient(next),
                  }));
                  setErrors((current) => ({ ...current, title: "" }));
                }}
                placeholder="Neon Runner"
                aria-invalid={Boolean(errors.title)}
                required
              />
            </Field>

            <Field label="Slug" error={errors.slug} htmlFor="slug" hint="used in /api/projects/[slug]">
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={values.slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    set("slug", slugifyClient(event.target.value));
                  }}
                  placeholder="neon-runner"
                  aria-invalid={Boolean(errors.slug)}
                  className="font-mono text-xs"
                  required
                />
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => {
                    setSlugLocked(false);
                    set("slug", slugifyClient(values.title));
                  }}
                  title="Regenerate from title"
                >
                  <Wand2 className="size-4" />
                </Button>
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category" error={errors.category} htmlFor="category">
                <Select value={values.category} onValueChange={(value) => set("category", value)}>
                  <SelectTrigger id="category" aria-invalid={Boolean(errors.category)}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GALLERY_FILTERS.filter((item) => item.value !== "all").map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex items-end">
                <div className="flex w-full items-center justify-between gap-3 rounded-md border border-edge bg-surface px-3 py-2.5">
                  <div>
                    <p className="text-sm text-fg">Featured</p>
                    <p className="font-mono text-[0.65rem] text-fg-subtle">pin to the top</p>
                  </div>
                  <Switch
                    checked={values.featured}
                    onCheckedChange={(checked) => set("featured", checked)}
                    aria-label="Featured project"
                  />
                </div>
              </div>
            </div>

            <Field
              label="Summary"
              error={errors.summary}
              htmlFor="summary"
              hint={`${values.summary.length}/${MAX_SUMMARY}`}
            >
              <Textarea
                id="summary"
                rows={3}
                value={values.summary}
                onChange={(event) => set("summary", event.target.value)}
                placeholder="One or two sentences shown on the project card."
                aria-invalid={Boolean(errors.summary)}
                className="min-h-20"
                required
              />
            </Field>
          </Panel>

          <Panel title="Description (Markdown)">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="description_markdown">Body</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => set("description_markdown", MARKDOWN_STARTER)}
                >
                  Insert template
                </Button>
                <Button
                  type="button"
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreview((value) => !value)}
                >
                  <Eye className="size-3.5" />
                  {showPreview ? "Hide preview" : "Preview"}
                </Button>
              </div>
            </div>

            <Textarea
              id="description_markdown"
              rows={14}
              value={values.description_markdown}
              onChange={(event) => set("description_markdown", event.target.value)}
              placeholder={MARKDOWN_STARTER}
              aria-invalid={Boolean(errors.description_markdown)}
              className="min-h-72 font-mono text-xs leading-relaxed"
            />

            {errors.description_markdown && (
              <p className="text-xs text-danger">{errors.description_markdown}</p>
            )}

            <p className="font-mono text-[0.65rem] text-fg-subtle">
              GitHub-flavoured Markdown · {values.description_markdown.trim().length} chars (min{" "}
              {MIN_DESCRIPTION})
            </p>

            {showPreview && (
              <div className="rounded-lg border border-edge bg-void/60 p-4">
                <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
                  live preview
                </p>
                {values.description_markdown.trim() ? (
                  <div className="prose-terminal">
                    <Markdown>{values.description_markdown}</Markdown>
                  </div>
                ) : (
                  <p className="text-sm text-fg-subtle">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </Panel>

          <Panel title="Media">
            <MediaManager
              label="Thumbnail"
              hint="Shown on the project card. 10 MB max — PNG, JPEG, WEBP, GIF, SVG, AVIF."
              value={values.thumbnail_url ? [values.thumbnail_url] : []}
              onChange={(next) => set("thumbnail_url", next[0] ?? "")}
            />

            <div className="h-px bg-edge" />

            <MediaManager
              label="Gallery"
              hint="Screenshots or gameplay video URLs (YouTube links and MP4/WEBM files render as players in the modal)."
              value={gallery}
              onChange={(next) => set("gallery_urls", next)}
              multiple
              max={12}
            />
          </Panel>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Panel title="Tech Stack">
            <TechStackInput value={values.tech_stack} onChange={(next) => set("tech_stack", next)} />
            {errors.tech_stack && <p className="text-xs text-danger">{errors.tech_stack}</p>}
          </Panel>

          <Panel title="Links">
            <Field label="Live demo URL" error={errors.demo_url} htmlFor="demo_url" optional>
              <Input
                id="demo_url"
                type="url"
                value={values.demo_url}
                onChange={(event) => set("demo_url", event.target.value)}
                placeholder="https://example.com"
                aria-invalid={Boolean(errors.demo_url)}
              />
            </Field>

            <Field label="Repository URL" error={errors.github_url} htmlFor="github_url" optional>
              <Input
                id="github_url"
                type="url"
                value={values.github_url}
                onChange={(event) => set("github_url", event.target.value)}
                placeholder="https://github.com/you/repo"
                aria-invalid={Boolean(errors.github_url)}
              />
            </Field>
          </Panel>

          <Panel title="Checklist">
            <ul className="space-y-2 text-xs">
              <Check ok={values.title.trim().length >= 3} label="Title" />
              <Check ok={Boolean(values.slug.trim())} label="Slug" />
              <Check ok={Boolean(values.category)} label="Category" />
              <Check ok={values.summary.trim().length >= 10} label="Summary" />
              <Check
                ok={values.description_markdown.trim().length >= MIN_DESCRIPTION}
                label="Description"
              />
              <Check ok={values.tech_stack.length > 0} label="Tech stack" />
              <Check ok={Boolean(values.thumbnail_url)} label="Thumbnail" />
            </ul>
          </Panel>

          <div className="rounded-xl border border-edge bg-surface/60 p-5">
            <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
              endpoint
            </p>
            <p className="font-mono text-[0.7rem] text-accent-soft">
              {mode === "create" ? "POST /api/projects" : `PUT /api/projects/${project?.id.slice(0, 8)}…`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-edge pt-5">
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/projects">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving…" : mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-edge bg-surface/60 p-5">
      <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-fg-subtle">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {optional && <span className="ml-1.5 normal-case text-fg-subtle/70">(optional)</span>}
        </Label>
        {hint && <span className="font-mono text-[0.65rem] text-fg-subtle">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`size-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-edge-strong"}`}
        aria-hidden
      />
      <span className={ok ? "text-fg-muted" : "text-fg-subtle"}>{label}</span>
      <span className="ml-auto font-mono text-[0.65rem] text-fg-subtle">
        {ok ? "ready" : "missing"}
      </span>
    </li>
  );
}
