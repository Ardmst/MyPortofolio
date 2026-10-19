"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePhotoProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Black & white profile photo with a subtle Electric Blue ring glow on hover.
 * Falls back to a monogram tile if the image fails to load.
 */
export function ProfilePhoto({ src, alt, className }: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("group relative", className)}>
      {/* Ambient glow behind the frame */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[1.75rem] bg-accent/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative overflow-hidden rounded-2xl border border-edge bg-surface transition-all duration-500 group-hover:border-accent/70 group-hover:shadow-[0_0_50px_-12px_var(--color-accent)]">
        <div className="relative aspect-square w-full">
          {failed ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-elevated via-surface to-void">
              <User className="size-20 text-edge-strong" strokeWidth={1} />
            </div>
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              priority
              sizes="(max-width: 768px) 240px, 288px"
              className="object-cover contrast-105 transition-all duration-700 group-hover:contrast-115 group-hover:brightness-105"
              onError={() => setFailed(true)}
            />
          )}

          {/* Monochrome scan gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)]"
          />
        </div>

        {/* Corner brackets */}
        <span aria-hidden className="absolute left-3 top-3 size-4 border-l border-t border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span aria-hidden className="absolute right-3 top-3 size-4 border-r border-t border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span aria-hidden className="absolute bottom-3 left-3 size-4 border-b border-l border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span aria-hidden className="absolute bottom-3 right-3 size-4 border-b border-r border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}
