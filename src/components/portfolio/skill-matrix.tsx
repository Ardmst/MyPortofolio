"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code2, Gamepad2, Palette, type LucideIcon } from "lucide-react";
import {
  SKILL_CATEGORY_DESCRIPTIONS_MAP,
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
} from "@/lib/constants";
import type { Skill, SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEGMENTS = 20;

const CATEGORY_ICONS: Record<SkillCategory, LucideIcon> = {
  programming: Code2,
  game_dev: Gamepad2,
  design: Palette,
};

interface SkillMatrixProps {
  skills: Skill[];
}

export function SkillMatrix({ skills }: SkillMatrixProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const grouped = SKILL_CATEGORY_ORDER.map((category) => ({
    category,
    items: skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => b.proficiency - a.proficiency),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="skills" className="relative scroll-mt-20 border-y border-edge bg-surface/25 py-16 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop opacity-20" />

      <div ref={ref} className="relative mx-auto w-full max-w-6xl px-5">
        <div className="space-y-2 border-b border-edge pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{"// capability"}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Skill Matrix
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
            Self-assessed proficiency across development, game engines and design tooling.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {grouped.map((group, groupIndex) => {
            const Icon = CATEGORY_ICONS[group.category];

            return (
              <div key={group.category} className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md border border-edge bg-elevated text-accent">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-fg">
                      {SKILL_CATEGORY_LABELS[group.category]}
                    </h3>
                    <p className="font-mono text-[0.7rem] text-fg-subtle">
                      {SKILL_CATEGORY_DESCRIPTIONS_MAP[group.category]}
                    </p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {group.items.map((skill, index) => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      active={inView}
                      delay={groupIndex * 120 + index * 60}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Arcade-style segmented meter. The fill state is derived from `active`
 * (in-view) rather than stored, and each segment carries its own
 * `transitionDelay` so the bar cascades left-to-right on reveal.
 */
function SkillRow({ skill, active, delay }: { skill: Skill; active: boolean; delay: number }) {
  const filled = active ? Math.round((skill.proficiency / 100) * SEGMENTS) : 0;

  return (
    <li className="group">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm text-fg-muted transition-colors group-hover:text-fg">{skill.name}</span>
        <span className="font-mono text-xs text-accent-soft">{skill.proficiency}</span>
      </div>

      <div
        className="flex gap-[3px]"
        role="meter"
        aria-label={`${skill.name} proficiency`}
        aria-valuenow={skill.proficiency}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTS }).map((_, segmentIndex) => (
          <motion.span
            key={segmentIndex}
            initial={false}
            style={{ transitionDelay: `${delay + segmentIndex * 18}ms` }}
            className={cn(
              "h-2.5 flex-1 rounded-[2px] transition-all duration-300",
              segmentIndex < filled
                ? "bg-accent shadow-[0_0_10px_-2px_var(--color-accent)] group-hover:bg-accent-soft"
                : "bg-edge group-hover:bg-edge-strong",
            )}
          />
        ))}
      </div>
    </li>
  );
}
