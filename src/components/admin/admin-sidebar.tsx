"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, Sparkles, Users, FolderKanban, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", Icon: FolderKanban, exact: false },
  { href: "/admin/skills", label: "Skills", Icon: Sparkles, exact: false },
  { href: "/admin/messages", label: "Messages", Icon: MessagesSquare, exact: false },
] as const;

interface AdminSidebarProps {
  email: string;
  mode: "supabase" | "local";
}

export function AdminSidebar({ email, mode }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-edge bg-surface/60 lg:min-h-dvh lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-md border border-edge bg-elevated text-accent">
          <Terminal className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs text-fg">
            ardmst<span className="text-accent">.dev</span>
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
            admin cms
          </p>
        </div>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-all",
                active
                  ? "border border-accent/40 bg-accent/12 text-accent-soft shadow-[0_0_20px_-10px_var(--color-accent)]"
                  : "border border-transparent text-fg-muted hover:bg-elevated hover:text-fg",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-edge px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full border border-edge bg-elevated font-mono text-[0.65rem] text-fg-muted">
            <Users className="size-3" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.7rem] text-fg-muted">{email}</p>
            <p className="font-mono text-[0.65rem] text-fg-subtle">
              {mode === "supabase" ? "Supabase Auth" : "local fallback"}
            </p>
          </div>
        </div>
        <Badge variant={mode === "supabase" ? "success" : "accent"} className="w-full justify-center">
          {mode === "supabase" ? "supabase" : "local dev mode"}
        </Badge>
      </div>
    </aside>
  );
}
