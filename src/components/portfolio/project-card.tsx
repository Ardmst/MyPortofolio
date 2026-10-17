"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, GitBranch, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.04, 0.24) }}
      className="group relative"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open details for ${project.title}`}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl border border-edge bg-surface text-left transition-all duration-300",
          "hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_18px_50px_-18px_var(--color-accent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        )}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-void">
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover grayscale-[0.85] brightness-[0.85] transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:brightness-100"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant="accent">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
            {project.featured && (
              <Badge variant="feature">
                <Star className="size-3" />
                Featured
              </Badge>
            )}
          </div>

          <span className="absolute right-3 top-3 flex size-8 translate-y-1 items-center justify-center rounded-md border border-accent/60 bg-void/80 text-accent opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="font-display text-base font-semibold text-fg transition-colors group-hover:text-accent-soft">
            {project.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.summary}</p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="outline">+{project.tech_stack.length - 4}</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-edge pt-3 font-mono text-[0.7rem] text-fg-subtle">
            {project.demo_url && (
              <span className="flex items-center gap-1">
                <ArrowUpRight className="size-3" /> live demo
              </span>
            )}
            {project.github_url && (
              <span className="flex items-center gap-1">
                <GitBranch className="size-3" /> repo
              </span>
            )}
            <span className="ml-auto">view details</span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
