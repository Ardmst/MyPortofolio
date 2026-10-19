"use client";

import { useId } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduced = useReducedMotion();
  const hasThumbnail = Boolean(project.thumbnail_url?.trim());
  // Sanitized unique id so the SVG grid pattern can be referenced per card instance.
  const patternId = `grid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: 18 };

  return (
    <motion.article
      layout
      initial={hidden}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.04, 0.24) }}
      className="group relative"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open details for ${project.title}`}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl border border-edge bg-surface text-left transition-all duration-300",
          "hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_0_25px_rgba(59,130,246,0.25),0_18px_50px_-18px_rgba(59,130,246,0.3)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        )}
      >
        {/* Media stage — shared 16:9 frame for image and fallback states */}
        <div className="relative aspect-video w-full overflow-hidden bg-void">
          {hasThumbnail ? (
            <>
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
            </>
          ) : (
            /* Fallback backdrop — blueprint grid + Electric Blue glow, never a blank dark box */
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -bottom-14 -left-8 size-56 rounded-full bg-accent/20 blur-3xl transition-all duration-500 group-hover:bg-accent/35" />
              <svg className="absolute inset-0 size-full opacity-60 transition-opacity duration-500 group-hover:opacity-90">
                <defs>
                  <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M30 0H0v30" fill="none" stroke="var(--color-edge-strong)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
              </svg>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.04)_50%,transparent_60%)]" />
              {/* Ghost monogram anchors the right half without touching the badge zone */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 select-none font-display text-[4.5rem] font-bold leading-none text-edge-strong/60">
                {project.title.charAt(0)}
              </span>
              {/* Bottom scrim keeps the fallback title legible over grid + glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-transparent" />
            </div>
          )}

          {!hasThumbnail && (
            <h3 className="absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] font-display text-lg font-semibold leading-snug tracking-tight text-fg drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {project.title}
            </h3>
          )}

          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            <Badge variant="accent" className="backdrop-blur-sm">
              {PROJECT_CATEGORY_LABELS[project.category]}
            </Badge>
            {project.featured && (
              <Badge variant="feature" className="backdrop-blur-sm">
                <Star className="size-3" />
                Featured
              </Badge>
            )}
          </div>

          <span className="absolute right-3 top-3 z-10 flex size-8 translate-y-1 items-center justify-center rounded-md border border-accent/60 bg-void/80 text-accent opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
