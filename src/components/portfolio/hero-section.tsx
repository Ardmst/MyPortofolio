"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroTerminal } from "@/components/portfolio/hero-terminal";
import { ProfilePhoto } from "@/components/portfolio/profile-photo";
import { SITE } from "@/lib/constants";
import type { Project, Skill } from "@/lib/types";

interface HeroSectionProps {
  skills: Skill[];
  projects: Project[];
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroSection({ skills, projects }: HeroSectionProps) {
  const reduced = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: reduced ? { duration: 0.25, delay } : { duration: 0.6, ease: EASE, delay },
  });

  const ctaContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0 : 0.09, delayChildren: reduced ? 0 : 0.5 },
    },
  };

  const ctaItem = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0.25 } : { duration: 0.45, ease: EASE },
    },
  };

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 size-[38rem] rounded-full bg-accent/10 blur-[140px] animate-glow-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        {/* Left — identity */}
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          {/* Photo: 1:1 and height-capped so the CTAs stay above the fold on 1080p/900p */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={reduced ? { duration: 0.25 } : { duration: 0.7, ease: EASE }}
            className="mx-auto w-60 sm:w-72 lg:mx-0 lg:w-72"
          >
            <ProfilePhoto src="/profile.jpg" alt={`${SITE.fullName} — ${SITE.role}`} />
          </motion.div>

          <motion.div {...reveal(0.15)} className="mt-6 space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <Radio className="size-3 animate-pulse" />
              {SITE.availability}
            </div>

            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
              {SITE.fullName}
            </h1>

            <p className="font-mono text-sm text-accent-soft">{SITE.role}</p>

            <p className="text-sm leading-relaxed text-fg-muted">{SITE.tagline}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 font-mono text-xs text-fg-subtle">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3" />
                {SITE.location}
              </span>
            </div>
          </motion.div>

          {/* CTAs staggered last so hero content is fully in place before they land */}
          <motion.div
            variants={ctaContainer}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-wrap gap-2"
          >
            <motion.div variants={ctaItem}>
              <Button asChild size="lg">
                <Link href="#projects">
                  View Projects
                  <ArrowDown className="size-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={ctaItem}>
              <Button asChild variant="outline" size="lg">
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                  Download CV
                  <Download className="size-4" />
                </a>
              </Button>
            </motion.div>
            <motion.div variants={ctaItem}>
              <Button asChild variant="outline" size="lg">
                <Link href="#contact">
                  Contact
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right — terminal (typewriter runs inside HeroTerminal, reduced-motion aware) */}
        <div className="w-full">
          <motion.div {...reveal(0.25)} className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="accent">interactive</Badge>
            <Badge variant="default">{projects.length} projects</Badge>
            <Badge variant="default">{skills.length} skills</Badge>
          </motion.div>
          <HeroTerminal skills={skills} projects={projects} />
        </div>
      </div>
    </section>
  );
}
