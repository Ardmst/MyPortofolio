"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, GitBranch, Layers, Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import { toVideoEmbed } from "@/lib/utils";
import type { Project } from "@/lib/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <AnimatePresence>
      {project && (
        /* Single AnimatePresence child so the card's own exit animation runs.
           `key` remounts the subtree per project, resetting the slider index. */
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div
            role="presentation"
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
            <ModalBody project={project} onClose={onClose} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalBody({ project, onClose }: { project: Project; onClose: () => void }) {
  const [slide, setSlide] = useState(0);

  const media = useMemo(() => {
    const items = [project.thumbnail_url, ...(project.gallery_urls ?? [])];
    // De-duplicate while preserving order — the thumbnail is often slide #1.
    return items.filter((item, index) => item && items.indexOf(item) === index);
  }, [project]);

  const step = useCallback(
    (delta: number) => {
      setSlide((value) => (value + delta + media.length) % media.length);
    },
    [media.length],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, step]);

  const active = media[slide];
  const embed = active ? toVideoEmbed(active) : null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} details`}
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 8 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-edge bg-surface shadow-2xl shadow-black/70"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-edge px-5 py-4 sm:px-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
            {project.featured && <Badge variant="feature">Featured</Badge>}
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {project.title}
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted">{project.summary}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="shrink-0 rounded-md border border-edge bg-elevated p-2 text-fg-subtle transition-colors hover:border-accent/60 hover:text-accent-soft"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid max-h-[70svh] overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Gallery */}
        <div className="border-b border-edge lg:border-b-0 lg:border-r">
          <div className="relative aspect-16/10 w-full bg-void">
            {embed?.kind === "youtube" ? (
              <iframe
                key={embed.src}
                src={embed.src}
                title={`${project.title} — gameplay video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : embed?.kind === "file" ? (
              <video
                key={embed.src}
                src={embed.src}
                controls
                playsInline
                className="absolute inset-0 size-full object-contain"
              />
            ) : active ? (
              <Image
                key={active}
                src={active}
                alt={`${project.title} preview ${slide + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
            ) : null}

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous media"
                  onClick={() => step(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-void/80 p-2 text-fg-muted backdrop-blur transition-colors hover:border-accent/60 hover:text-accent-soft"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next media"
                  onClick={() => step(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-void/80 p-2 text-fg-muted backdrop-blur transition-colors hover:border-accent/60 hover:text-accent-soft"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>

          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {media.map((item, index) => {
                const isVideo = Boolean(toVideoEmbed(item));

                return (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => setSlide(index)}
                    aria-label={`Show media ${index + 1}`}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-md border transition-all ${
                      index === slide
                        ? "border-accent shadow-[0_0_16px_-4px_var(--color-accent)]"
                        : "border-edge opacity-60 hover:opacity-100"
                    }`}
                  >
                    {isVideo ? (
                      <span className="flex size-full items-center justify-center bg-elevated text-accent">
                        <Play className="size-4" />
                      </span>
                    ) : (
                      <Image
                        src={item}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-fg-subtle">
              <Layers className="size-3.5" />
              Tech stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="accent">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="prose-terminal">
            <MarkdownBlock source={project.description_markdown} />
          </div>

          <div className="mt-auto flex flex-wrap gap-2 border-t border-edge pt-5">
            {project.demo_url ? (
              <Button asChild>
                <a href={project.demo_url} target="_blank" rel="noreferrer noopener">
                  Live Demo
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : (
              <Button disabled variant="subtle">
                Demo unavailable
              </Button>
            )}

            {project.github_url ? (
              <Button asChild variant="outline">
                <a href={project.github_url} target="_blank" rel="noreferrer noopener">
                  <GitBranch className="size-4" />
                  GitHub Repo
                </a>
              </Button>
            ) : (
              <Button disabled variant="subtle">
                <GitBranch className="size-4" />
                Private repo
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Loaded lazily so react-markdown stays out of the initial bundle. */
function MarkdownBlock({ source }: { source: string }) {
  const [Renderer, setRenderer] = useState<null | React.ComponentType<{ children: string }>>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/components/portfolio/markdown").then((module) => {
      if (!cancelled) setRenderer(() => module.Markdown);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Renderer) {
    return <p className="whitespace-pre-wrap text-sm text-fg-muted">{source}</p>;
  }

  return <Renderer>{source}</Renderer>;
}
