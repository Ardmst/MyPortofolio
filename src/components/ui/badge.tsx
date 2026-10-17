import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-edge bg-elevated text-fg-muted",
        accent: "border-blue-800/50 bg-blue-950/50 text-blue-400",
        success: "border-emerald-800/50 bg-emerald-950/40 text-emerald-400",
        outline: "border-edge bg-transparent text-fg-subtle",
        feature: "border-accent/40 bg-accent/10 text-accent-soft",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
