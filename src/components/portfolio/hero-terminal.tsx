"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, TerminalSquare } from "lucide-react";
import { PROJECT_CATEGORY_LABELS, SITE, SKILL_CATEGORY_LABELS } from "@/lib/constants";
import type { Project, Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeroTerminalProps {
  skills: Skill[];
  projects: Project[];
}

type LineKind = "input" | "output" | "error";

interface Line {
  id: number;
  kind: LineKind;
  content: ReactNode;
}

const PROMPT = "visitor@ardmst:~$";

const HELP_ROWS: { command: string; description: string }[] = [
  { command: "cat profile.json", description: "who I am, stack and availability" },
  { command: "skills", description: "proficiency matrix summary" },
  { command: "projects", description: "list everything in the gallery" },
  { command: "contact", description: "how to reach me" },
  { command: "ls", description: "list page sections" },
  { command: "clear", description: "wipe the terminal buffer" },
];

function LineText({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("whitespace-pre-wrap break-words", className)}>{children}</div>;
}

export function HeroTerminal({ skills, projects }: HeroTerminalProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [autoTyping, setAutoTyping] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback((kind: LineKind, content: ReactNode) => {
    nextId.current += 1;
    const lineId = nextId.current;
    setLines((current) => [...current, { id: lineId, kind, content }]);
  }, []);

  const profileJson = useMemo(
    () => ({
      name: SITE.fullName,
      handle: `@${SITE.handle} (from "Ardi Mustaqim")`,
      role: SITE.role,
      location: SITE.location,
      status: SITE.availability,
      stack: {
        languages: ["TypeScript", "C#", "SQL", "GDScript"],
        frontend: ["Next.js", "React", "Tailwind CSS"],
        backend: ["Node.js", "Supabase", "PostgreSQL"],
        engine: ["Unity", "Godot"],
        design: ["Figma", "Design Tokens"],
      },
      projects: projects.length,
      skills: skills.length,
      contact: SITE.email,
    }),
    [projects.length, skills.length],
  );

  const buildOutput = useCallback(
    (raw: string): { node: ReactNode; kind: LineKind } | "clear" => {
      const command = raw.trim().toLowerCase();

      if (command === "clear") return "clear";

      if (command === "help" || command === "--help") {
        return {
          kind: "output",
          node: (
            <div className="space-y-1">
              <LineText className="text-fg-muted">Available commands:</LineText>
              {HELP_ROWS.map((row) => (
                <div key={row.command} className="flex flex-wrap gap-x-3">
                  <span className="min-w-44 text-accent-soft">{row.command}</span>
                  <span className="text-fg-subtle">{row.description}</span>
                </div>
              ))}
            </div>
          ),
        };
      }

      if (command === "cat profile.json" || command === "profile") {
        return {
          kind: "output",
          node: (
            <pre className="text-[0.78rem] leading-relaxed text-fg-muted">
              {JSON.stringify(profileJson, null, 2)}
            </pre>
          ),
        };
      }

      if (command === "skills") {
        return {
          kind: "output",
          node: (
            <div className="space-y-1.5">
              <LineText className="text-fg-muted">
                {skills.length} skills indexed — scroll to{" "}
                <span className="text-accent-soft">#skills</span> for the full matrix.
              </LineText>
              {skills.slice(0, 6).map((skill) => (
                <div key={skill.id} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-fg-muted">{skill.name}</span>
                  <span className="flex-1 overflow-hidden rounded-sm bg-elevated">
                    <span
                      className="block h-1.5 rounded-sm bg-accent"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-accent-soft">{skill.proficiency}</span>
                  <span className="hidden w-28 shrink-0 text-fg-subtle sm:block">
                    {SKILL_CATEGORY_LABELS[skill.category]}
                  </span>
                </div>
              ))}
            </div>
          ),
        };
      }

      if (command === "projects") {
        const groups = new Map<string, Project[]>();
        for (const project of projects) {
          const list = groups.get(project.category) ?? [];
          list.push(project);
          groups.set(project.category, list);
        }

        return {
          kind: "output",
          node: (
            <div className="space-y-2">
              <LineText className="text-fg-muted">
                {projects.length} projects loaded. Open the gallery below to see the detail modals.
              </LineText>
              {[...groups.entries()].map(([category, list]) => (
                <div key={category} className="space-y-0.5">
                  <LineText className="text-fg-subtle">
                    {PROJECT_CATEGORY_LABELS[category as Project["category"]]}/
                  </LineText>
                  {list.map((project) => (
                    <div key={project.id} className="pl-4 text-fg-muted">
                      <span className="text-accent-soft">→</span> {project.title}{" "}
                      <span className="text-fg-subtle">
                        ({project.tech_stack.slice(0, 3).join(", ")})
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ),
        };
      }

      if (command === "contact") {
        return {
          kind: "output",
          node: (
            <LineText className="text-fg-muted">
              Reach me at <span className="text-accent-soft">{SITE.email}</span> — or use the form in{" "}
              <span className="text-accent-soft">#contact</span>.
            </LineText>
          ),
        };
      }

      if (command === "ls") {
        return {
          kind: "output",
          node: (
            <div className="flex flex-wrap gap-x-4 text-fg-muted">
              {["home", "projects", "skills", "contact", "admin/"].map((item) => (
                <span key={item}>
                  <span className="text-accent-soft">{item === "admin/" ? "drwx" : "-rw-"}</span> {item}
                </span>
              ))}
            </div>
          ),
        };
      }

      if (command === "whoami") {
        return {
          kind: "output",
          node: (
            <LineText className="text-fg-muted">
              {SITE.fullName} — {SITE.role}
            </LineText>
          ),
        };
      }

      if (command === "scroll projects") {
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
        return {
          kind: "output",
          node: <LineText className="text-fg-subtle">scrolling to #projects…</LineText>,
        };
      }

      return {
        kind: "error",
        node: (
          <LineText className="text-danger">
            command not found: {raw.trim()} — try <span className="text-accent-soft">help</span>
          </LineText>
        ),
      };
    },
    [profileJson, projects, skills],
  );

  const runCommand = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return;

      push("input", value);
      const result = buildOutput(value);

      if (result === "clear") {
        setLines([]);
        return;
      }

      push(result.kind, result.node);
    },
    [buildOutput, push],
  );

  /* Auto-play the intro sequence exactly once. */
  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeInto = async (command: string) => {
      for (let index = 1; index <= command.length; index += 1) {
        if (cancelled) return;
        setAutoTyping(command.slice(0, index));
        await sleep(38);
      }
      await sleep(200);
      if (cancelled) return;
      setAutoTyping(null);
      runCommand(command);
      await sleep(300);
    };

    const run = async () => {
      if (reduced) {
        /* Reduced motion: skip the typewriter, render the transcript instantly. */
        setReady(true);
        runCommand("cat profile.json");
        runCommand("help");
        return;
      }
      await sleep(600);
      if (cancelled) return;
      setReady(true);
      await typeInto("cat profile.json");
      await typeInto("help");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [runCommand, reduced]);

  /* Keep the buffer pinned to the newest line. */
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lines, autoTyping]);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.35 }}
      onClick={() => inputRef.current?.focus()}
      className="relative w-full overflow-hidden rounded-xl border border-edge/80 bg-[#0b0b0e] shadow-[0_0_50px_-20px_rgba(59,130,246,0.25)] transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-edge/80 bg-surface/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[0.7rem] text-fg-subtle">
            <TerminalSquare className="size-3 text-accent" />
            profile.sh — /dev/ardmst
          </span>
        </div>
        <div className="hidden items-center gap-1.5 font-mono text-[0.65rem] text-fg-subtle sm:flex">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          online
        </div>
      </div>

      <div className="terminal-scan relative">
        <div
          ref={scrollRef}
          className="h-[21rem] overflow-y-auto px-4 py-3 font-mono text-[0.8rem] leading-relaxed sm:h-[23rem]"
        >
          <LineText className="text-fg-subtle">
            ardmst shell v1.0.0 — type <span className="text-accent-soft">help</span> to list commands.
          </LineText>
          <div className="h-2" />

          {lines.map((line) => (
            <div key={line.id} className="mb-1.5">
              {line.kind === "input" ? (
                <LineText>
                  <span className="text-emerald-400">{PROMPT}</span>{" "}
                  <span className="text-fg">{line.content}</span>
                </LineText>
              ) : (
                line.content
              )}
            </div>
          ))}

          {autoTyping !== null && (
            <LineText>
              <span className="text-emerald-400">{PROMPT}</span>{" "}
              <span className="text-fg">{autoTyping}</span>
              <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent animate-caret" />
            </LineText>
          )}

          {autoTyping === null && ready && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-emerald-400">{PROMPT}</span>
              <span className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      runCommand(input);
                      setInput("");
                    }
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal command input"
                  placeholder="try: skills"
                  className="w-full bg-transparent text-fg caret-transparent placeholder:text-edge-strong focus:outline-none"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-0 inline-block h-3.5 w-1.5 translate-y-1 bg-accent animate-caret"
                  style={{ left: `${input.length}ch` }}
                />
              </span>
              <CornerDownLeft className="size-3 shrink-0 text-edge-strong" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-edge/80 bg-surface/80 px-3 py-2.5 backdrop-blur-sm">
        <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">Quick:</span>
        {["help", "cat profile.json", "skills", "projects", "contact", "clear"].map((command) => (
          <button
            key={command}
            type="button"
            disabled={!ready}
            onClick={(event) => {
              event.stopPropagation();
              runCommand(command);
              inputRef.current?.focus();
            }}
            className="rounded-md border border-edge/80 bg-elevated/80 px-2 py-0.5 font-mono text-[0.68rem] text-fg-subtle transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10 hover:text-accent-soft hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] disabled:opacity-40"
          >
            {command}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
