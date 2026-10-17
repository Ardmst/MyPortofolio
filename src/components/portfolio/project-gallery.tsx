"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ProjectModal } from "@/components/portfolio/project-modal";
import { GALLERY_FILTERS, type GalleryFilter } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectGalleryProps {
  projects: Project[];
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const counts = useMemo(() => {
    const map = new Map<GalleryFilter, number>([["all", projects.length]]);
    for (const project of projects) {
      map.set(project.category, (map.get(project.category) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((project) => project.category === filter)),
    [filter, projects],
  );

  return (
    <section id="projects" className="relative scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="flex flex-col gap-6 border-b border-edge pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {"// portfolio"}
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Selected Work
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
                Games, web applications and interface systems. Open a card for the full breakdown,
                gallery and repository links.
              </p>
            </div>

            <p className="font-mono text-xs text-fg-subtle">
              Showing{" "}
              <span className="text-accent-soft">{visible.length}</span>{" "}
              {visible.length === 1 ? "project" : "projects"}
            </p>
          </div>

          {/* Filter tabs */}
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap gap-2"
          >
            {GALLERY_FILTERS.map((item) => {
              const active = filter === item.value;
              const count = counts.get(item.value) ?? 0;

              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "group flex items-center gap-2 rounded-md border px-3.5 py-2 font-mono text-xs transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    active
                      ? "border-accent bg-accent/15 text-accent-soft shadow-[0_0_22px_-8px_var(--color-accent)]"
                      : "border-edge bg-surface text-fg-muted hover:border-edge-strong hover:text-fg",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[0.65rem]",
                      active ? "bg-accent/25 text-accent-soft" : "bg-elevated text-fg-subtle",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="mt-14 flex flex-col items-center gap-3 rounded-xl border border-dashed border-edge bg-surface/40 py-20 text-center">
            <FolderOpen className="size-8 text-edge-strong" />
            <p className="font-mono text-sm text-fg-muted">No projects in this category yet.</p>
            <p className="text-xs text-fg-subtle">
              Add one from the admin CMS at /admin/projects.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpen={setSelected}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
