import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm text-fg transition-all",
        "placeholder:text-fg-subtle",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:mr-3 file:rounded file:border-0 file:bg-elevated file:px-3 file:py-1 file:text-xs file:text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm text-fg transition-all",
        "placeholder:text-fg-subtle",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
