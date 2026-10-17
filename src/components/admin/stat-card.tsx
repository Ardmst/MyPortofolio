import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  Icon: ComponentType<{ className?: string }>;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, hint, Icon, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-edge bg-surface/80 p-5 transition-colors",
        accent ? "hover:border-accent/60" : "hover:border-edge-strong",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-fg-subtle">{label}</p>
          <p
            className={cn(
              "font-display text-3xl font-semibold tracking-tight",
              accent ? "text-accent-soft" : "text-fg",
            )}
          >
            {value}
          </p>
        </div>

        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-md border transition-colors",
            accent
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-edge bg-elevated text-fg-subtle group-hover:text-fg-muted",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      {hint && <p className="mt-2 font-mono text-[0.68rem] text-fg-subtle">{hint}</p>}

      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-accent/10 blur-2xl"
        />
      )}
    </div>
  );
}
