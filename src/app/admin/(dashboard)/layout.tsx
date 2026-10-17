import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Radio, Terminal } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { Badge } from "@/components/ui/badge";
import { getAdminUser } from "@/lib/auth/admin";
import { dataMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gates this, but never trust a single layer.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const mode = dataMode();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar email={admin.email} mode={mode} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-edge bg-void/85 px-5 py-3 backdrop-blur-lg">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-md border border-edge bg-surface text-accent">
              <Terminal className="size-3.5" />
            </span>
            <span className="font-mono text-xs text-fg">portototo</span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Badge variant={mode === "supabase" ? "success" : "accent"}>
              <Radio className="size-3" />
              {mode === "supabase" ? "supabase live" : "local store"}
            </Badge>
            <span className="font-mono text-[0.7rem] text-fg-subtle">
              {mode === "supabase"
                ? "reading & writing your Supabase project"
                : "Supabase env not set — using .local-data/db.json"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 font-mono text-[0.7rem] text-fg-muted transition-colors hover:border-accent/60 hover:text-accent-soft"
            >
              <ExternalLink className="size-3" />
              View site
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
