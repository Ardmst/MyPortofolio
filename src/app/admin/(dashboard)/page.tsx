import Link from "next/link";
import {
  ArrowUpRight,
  Gamepad2,
  Inbox,
  Layers,
  MonitorSmartphone,
  Palette,
  Plus,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, listMessages, listProjects } from "@/lib/data/repository";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, projects, messages] = await Promise.all([
    getDashboardStats(),
    listProjects(),
    listMessages(),
  ]);

  const recentProjects = projects.slice(0, 5);
  const recentMessages = messages.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
            {"// dashboard"}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Overview
          </h1>
          <p className="text-sm text-fg-muted">
            Everything published on the public site, plus the inbound inbox.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            Add New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={stats.totalProjects} Icon={Layers} accent hint="all categories" />
        <StatCard label="Unread messages" value={stats.unreadMessages} Icon={Inbox} accent hint={`${stats.totalMessages} total received`} />
        <StatCard label="Game dev" value={stats.byCategory.game} Icon={Gamepad2} hint="Unity / Godot builds" />
        <StatCard label="Web & app" value={stats.byCategory.web_app} Icon={MonitorSmartphone} hint="production apps" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="UI/UX design" value={stats.byCategory.design} Icon={Palette} hint="systems & concepts" />
        <StatCard label="Skills indexed" value={stats.totalSkills} Icon={Star} hint="drives the skill matrix" />
        <div className="grid gap-3 rounded-xl border border-edge bg-surface/60 p-5 sm:col-span-2">
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-fg-subtle">
            Category distribution
          </p>
          <div className="space-y-3">
            {(["game", "web_app", "design"] as const).map((category) => {
              const total = Math.max(stats.totalProjects, 1);
              const percent = Math.round((stats.byCategory[category] / total) * 100);

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[0.7rem]">
                    <span className="text-fg-muted">{PROJECT_CATEGORY_LABELS[category]}</span>
                    <span className="text-accent-soft">
                      {stats.byCategory[category]} · {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-edge">
                    <div
                      className="h-full rounded-full bg-accent shadow-[0_0_12px_-2px_var(--color-accent)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent lists */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-edge bg-surface/60">
          <header className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5">
            <h2 className="font-display text-sm font-semibold text-fg">Recent projects</h2>
            <Link
              href="/admin/projects"
              className="flex items-center gap-1 font-mono text-[0.68rem] text-fg-subtle transition-colors hover:text-accent-soft"
            >
              manage all
              <ArrowUpRight className="size-3" />
            </Link>
          </header>

          {recentProjects.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-fg-subtle">
              No projects yet — create your first one.
            </p>
          ) : (
            <ul className="divide-y divide-edge">
              {recentProjects.map((project) => (
                <li key={project.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-edge bg-elevated font-mono text-[0.65rem] text-fg-subtle">
                    {project.title.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">{project.title}</p>
                    <p className="truncate font-mono text-[0.65rem] text-fg-subtle">/{project.slug}</p>
                  </div>
                  <Badge variant="accent">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="shrink-0 font-mono text-[0.68rem] text-fg-subtle transition-colors hover:text-accent-soft"
                  >
                    edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-edge bg-surface/60">
          <header className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5">
            <h2 className="font-display text-sm font-semibold text-fg">Latest messages</h2>
            <Link
              href="/admin/messages"
              className="flex items-center gap-1 font-mono text-[0.68rem] text-fg-subtle transition-colors hover:text-accent-soft"
            >
              open inbox
              <ArrowUpRight className="size-3" />
            </Link>
          </header>

          {recentMessages.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-fg-subtle">Inbox is empty.</p>
          ) : (
            <ul className="divide-y divide-edge">
              {recentMessages.map((message) => (
                <li key={message.id} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      message.is_read ? "bg-edge-strong" : "bg-accent shadow-[0_0_10px_var(--color-accent)]"
                    }`}
                    aria-label={message.is_read ? "read" : "unread"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm text-fg">
                      <span className="truncate">{message.sender_name}</span>
                      {!message.is_read && <Badge variant="accent">new</Badge>}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {message.subject || "(no subject)"}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[0.65rem] text-fg-subtle">
                    {relativeTime(message.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
