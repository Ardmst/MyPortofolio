import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";

const SOCIALS = [
  { href: `mailto:${SITE.email}`, label: "Email" },
  { href: "https://github.com/", label: "GitHub" },
  { href: "https://linkedin.com/", label: "LinkedIn" },
  { href: "https://twitter.com/", label: "X / Twitter" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-edge bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link href="#home" className="group flex items-center gap-2.5">
              <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-md border border-edge bg-surface transition-all duration-300 group-hover:border-accent/70 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]">
                <img src="/favicon.svg" alt="logo" className="size-5 object-contain" />
              </span>
              <span className="font-mono text-sm tracking-tight text-fg transition-colors group-hover:text-accent-soft">
                &gt;_ {SITE.name.toLowerCase()}
                <span className="text-accent">.dev</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-fg-subtle">
              {SITE.role} — building for the web and for games. {SITE.domain}
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-fg-subtle">Navigate</p>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-fg-muted transition-colors hover:text-accent-soft"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/admin"
              className="text-xs text-fg-muted transition-colors hover:text-accent-soft"
            >
              Admin CMS
            </Link>
          </nav>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-fg-subtle">Elsewhere</p>
            {SOCIALS.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="group flex items-center gap-1.5 font-mono text-xs text-fg-muted transition-colors hover:text-accent-soft"
              >
                {label}
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-edge pt-6 font-mono text-[0.7rem] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE.fullName}. All rights reserved.
          </span>
          <span>Built with Next.js · Supabase · Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
