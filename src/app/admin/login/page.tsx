import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck, Terminal } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";
import { dataMode, localAdminEmail } from "@/lib/env";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const mode = dataMode();

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 size-[32rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]"
      />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-fg-subtle transition-colors hover:text-accent-soft"
        >
          <ArrowLeft className="size-3" />
          back to site
        </Link>

        <div className="rounded-2xl border border-edge bg-surface/90 p-6 shadow-2xl shadow-black/60 backdrop-blur-sm sm:p-8">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-md border border-edge bg-elevated text-accent">
                <Terminal className="size-4" />
              </span>
              <div>
                <p className="font-mono text-sm text-fg">
                  {SITE.name.toLowerCase()}
                  <span className="text-accent">.dev</span>
                </p>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
                  admin cms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={mode === "supabase" ? "success" : "accent"}>
                <ShieldCheck className="size-3" />
                {mode === "supabase" ? "Supabase Auth" : "local fallback auth"}
              </Badge>
            </div>

            <h1 className="font-display text-xl font-semibold tracking-tight text-fg">
              Sign in to the CMS
            </h1>
            <p className="text-sm leading-relaxed text-fg-muted">
              Manage projects, uploads and the contact inbox. This route is protected by middleware.
            </p>
          </div>

          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-lg border border-edge bg-elevated/40" />}
          >
            <LoginForm mode={mode} hintEmail={localAdminEmail} />
          </Suspense>
        </div>

        <p className="mt-5 text-center font-mono text-[0.7rem] text-fg-subtle">
          POST /api/auth/login · session cookie · 8h expiry
        </p>
      </div>
    </div>
  );
}
