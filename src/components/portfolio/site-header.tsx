"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Shield, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-edge bg-void/85 backdrop-blur-lg" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="#home" className="group flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md border border-edge bg-surface text-accent transition-colors group-hover:border-accent/60">
            <Terminal className="size-4" />
          </span>
          <span className="font-mono text-sm tracking-tight text-fg">
            {SITE.name.toLowerCase()}
            <span className="text-accent">.dev</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-mono text-xs text-fg-muted transition-colors hover:text-accent-soft"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/admin">
              <Shield className="size-3.5" />
              Admin
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-edge bg-void/95 backdrop-blur-lg md:hidden"
          >
            <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 font-mono text-sm text-fg-muted transition-colors hover:bg-elevated hover:text-accent-soft"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-md border border-edge px-3 py-2.5 font-mono text-sm text-fg-muted transition-colors hover:border-accent/60 hover:text-accent-soft"
              >
                <Shield className="size-3.5" />
                Admin CMS
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
