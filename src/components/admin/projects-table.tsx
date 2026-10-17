"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GALLERY_FILTERS, PROJECT_CATEGORY_LABELS, type GalleryFilter } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 5;

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [rows, setRows] = useState(projects);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GalleryFilter>("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return rows.filter((project) => {
      const matchesCategory = category === "all" || project.category === category;
      if (!matchesCategory) return false;
      if (!needle) return true;

      return (
        project.title.toLowerCase().includes(needle) ||
        project.slug.toLowerCase().includes(needle) ||
        project.summary.toLowerCase().includes(needle) ||
        project.tech_stack.some((tech) => tech.toLowerCase().includes(needle))
      );
    });
  }, [rows, query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function removeProject(project: Project) {
    const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to delete the project.");
    }

    setRows((current) => current.filter((row) => row.id !== project.id));
    toast.success("Project deleted", { description: `${project.title} was removed.` });
  }

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Search by title, slug, summary or tech…"
            aria-label="Search projects"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                resetPage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value as GalleryFilter);
            resetPage();
          }}
        >
          <SelectTrigger className="sm:w-52" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {GALLERY_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="font-mono text-[0.7rem] text-fg-subtle">
        {filtered.length} of {rows.length} projects
        {category !== "all" && ` · filter: ${PROJECT_CATEGORY_LABELS[category]}`}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-edge bg-surface/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Thumb</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden lg:table-cell">Tech</TableHead>
              <TableHead className="hidden xl:table-cell">Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-fg-subtle">
                  No projects match your filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="relative size-11 overflow-hidden rounded-md border border-edge bg-void">
                      <Image
                        src={project.thumbnail_url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover grayscale-[0.6]"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="max-w-72">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-fg">{project.title}</span>
                      {project.featured && (
                        <Star className="size-3 shrink-0 text-accent" aria-label="Featured" />
                      )}
                    </div>
                    <p className="truncate font-mono text-[0.68rem] text-fg-subtle">/{project.slug}</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="accent">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <Badge variant="outline">+{project.tech_stack.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden whitespace-nowrap font-mono text-[0.68rem] xl:table-cell">
                    {formatDate(project.updated_at)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="ghost" size="icon-sm" title="View on site">
                        <Link href={`/#projects`} target="_blank">
                          <Eye className="size-3.5" />
                        </Link>
                      </Button>

                      <Button asChild variant="subtle" size="icon-sm" title="Edit project">
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <Pencil className="size-3.5" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete project"
                        onClick={() => setTarget(project)}
                        className="text-danger/80 hover:bg-red-950/40 hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-4 py-3">
          <p className="font-mono text-[0.68rem] text-fg-subtle">
            Page {currentPage} / {pageCount}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage >= pageCount}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete this project?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="text-fg">{target?.title ?? ""}</span>? This removes it from the
            database and the public gallery, and cannot be undone.
          </>
        }
        confirmLabel="Delete project"
        onConfirm={() => (target ? removeProject(target) : Promise.resolve())}
        onConfirmed={() => setTarget(null)}
      />
    </div>
  );
}
