"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !border !border-edge !text-fg !rounded-lg !shadow-2xl !shadow-black/60",
          title: "!text-fg !text-sm !font-medium",
          description: "!text-fg-muted !text-xs",
          actionButton: "!bg-accent !text-white",
          cancelButton: "!bg-elevated !text-fg-muted",
          success: "!border-emerald-800/60",
          error: "!border-red-800/60",
        },
      }}
    />
  );
}
