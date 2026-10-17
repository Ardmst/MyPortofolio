import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { ProjectsTable } from "@/components/admin/projects-table";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
            {"// projects"}
          </p>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            <FolderKanban className="size-6 text-accent" />
            Project Manager
          </h1>
          <p className="text-sm text-fg-muted">
            Create, edit and delete portfolio entries. Changes appear on the public gallery
            immediately.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            New Project
          </Link>
        </Button>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  );
}
