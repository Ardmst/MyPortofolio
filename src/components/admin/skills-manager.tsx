"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
} from "@/lib/constants";
import type { Skill, SkillCategory } from "@/lib/types";

interface SkillsManagerProps {
  skills: Skill[];
}

interface SkillFormValues {
  name: string;
  category: SkillCategory | "";
  proficiency: number;
  icon_name: string;
  display_order: number;
}

const BLANK: SkillFormValues = {
  name: "",
  category: "",
  proficiency: 50,
  icon_name: "",
  display_order: 0,
};

/** Client-side mirror of `validateSkill` in lib/validation.ts. */
function validateForm(values: SkillFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = values.name.trim();
  if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  if (!values.category) errors.category = "Pick a category.";
  if (!Number.isInteger(values.proficiency) || values.proficiency < 1 || values.proficiency > 100) {
    errors.proficiency = "Proficiency must be an integer between 1 and 100.";
  }
  if (values.icon_name.trim().length > 50) {
    errors.icon_name = "Icon name must be 50 characters or fewer.";
  }
  if (!Number.isInteger(values.display_order) || values.display_order < 0) {
    errors.display_order = "Display order must be a non-negative integer.";
  }

  return errors;
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(skills);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Skill | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SkillFormValues>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState<Skill | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((skill) => {
      return (
        skill.name.toLowerCase().includes(needle) ||
        skill.category.includes(needle) ||
        (skill.icon_name ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, query]);

  function openCreate() {
    setEditing(null);
    setValues(BLANK);
    setErrors({});
    setOpen(true);
  }

  function openEdit(skill: Skill) {
    setEditing(skill);
    setValues({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon_name: skill.icon_name ?? "",
      display_order: skill.display_order,
    });
    setErrors({});
    setOpen(true);
  }

  function set<K extends keyof SkillFormValues>(field: K, value: SkillFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = editing ? `/api/skills/${editing.id}` : "/api/skills";
      const response = await fetch(endpoint, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          category: values.category,
          proficiency: values.proficiency,
          icon_name: values.icon_name.trim() || null,
          display_order: values.display_order,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: Skill;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !payload.data) {
        if (payload.errors) setErrors(payload.errors);
        toast.error(payload.error ?? "Save failed.");
        return;
      }

      const saved = payload.data;
      setRows((current) =>
        editing
          ? current.map((row) => (row.id === saved.id ? saved : row))
          : [...current, saved],
      );
      setOpen(false);
      // Keep the server-rendered header / public skill matrix in sync.
      router.refresh();
      toast.success(editing ? "Skill updated" : "Skill created", {
        description: `${saved.name} · ${SKILL_CATEGORY_LABELS[saved.category]}`,
      });
    } catch {
      toast.error("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(skill: Skill) {
    const response = await fetch(`/api/skills/${skill.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to delete the skill.");
    }

    setRows((current) => current.filter((row) => row.id !== skill.id));
    router.refresh();
    toast.success("Skill deleted", { description: `${skill.name} was removed.` });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, category or icon…"
            aria-label="Search skills"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Skill
        </Button>
      </div>

      <p className="font-mono text-[0.7rem] text-fg-subtle">
        {filtered.length} of {rows.length} skills
      </p>

      <div className="rounded-xl border border-edge bg-surface/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-52">Proficiency</TableHead>
              <TableHead className="hidden md:table-cell">Icon</TableHead>
              <TableHead className="hidden md:table-cell">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-fg-subtle">
                  No skills match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="max-w-56">
                    <p className="truncate font-medium text-fg">{skill.name}</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="accent">{SKILL_CATEGORY_LABELS[skill.category]}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-edge">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-accent-soft">{skill.proficiency}</span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden font-mono text-[0.7rem] text-fg-subtle md:table-cell">
                    {skill.icon_name ?? "—"}
                  </TableCell>

                  <TableCell className="hidden font-mono text-[0.7rem] text-fg-subtle md:table-cell">
                    {skill.display_order}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit skill"
                        onClick={() => openEdit(skill)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete skill"
                        onClick={() => setTarget(skill)}
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
      </div>

      {/* Create / edit dialog */}
      <Dialog open={open} onOpenChange={(next) => !saving && setOpen(next)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit skill" : "New skill"}</DialogTitle>
            <DialogDescription>
              Proficiency is 1–100 and drives the segmented bar on the public skill matrix.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Name</Label>
              <Input
                id="skill-name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="TypeScript"
                aria-invalid={Boolean(errors.name)}
                required
              />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-category">Category</Label>
              <Select value={values.category} onValueChange={(value) => set("category", value as SkillCategory)}>
                <SelectTrigger id="skill-category" aria-invalid={Boolean(errors.category)}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORY_ORDER.map((item) => (
                    <SelectItem key={item} value={item}>
                      {SKILL_CATEGORY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-danger">{errors.category}</p>}
            </div>

            {/* Proficiency slider — hard-clamped to the 1–100 range. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skill-proficiency">Proficiency</Label>
                <span className="font-mono text-xs text-accent-soft">{values.proficiency}/100</span>
              </div>
              <input
                id="skill-proficiency"
                type="range"
                min={1}
                max={100}
                step={1}
                value={values.proficiency}
                onChange={(event) => set("proficiency", Math.round(Number(event.target.value)))}
                onBlur={(event) =>
                  set("proficiency", Math.min(100, Math.max(1, Math.round(Number(event.target.value)))))
                }
                aria-invalid={Boolean(errors.proficiency)}
                className="w-full accent-accent"
              />
              {errors.proficiency && <p className="text-xs text-danger">{errors.proficiency}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="skill-icon">
                  Icon name
                  <span className="ml-1.5 normal-case text-fg-subtle/70">(optional)</span>
                </Label>
                <Input
                  id="skill-icon"
                  value={values.icon_name}
                  onChange={(event) => set("icon_name", event.target.value)}
                  placeholder="Gamepad2"
                  className="font-mono text-xs"
                  aria-invalid={Boolean(errors.icon_name)}
                />
                {errors.icon_name && <p className="text-xs text-danger">{errors.icon_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-order">Display order</Label>
                <Input
                  id="skill-order"
                  type="number"
                  min={0}
                  step={1}
                  value={values.display_order}
                  onChange={(event) => set("display_order", Math.round(Number(event.target.value)))}
                  aria-invalid={Boolean(errors.display_order)}
                />
                {errors.display_order && <p className="text-xs text-danger">{errors.display_order}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-edge pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Skill"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(next) => !next && setTarget(null)}
        title="Delete this skill?"
        description={
          <>
            <span className="text-fg">{target?.name ?? ""}</span> will be removed from the database
            and the public skill matrix. This cannot be undone.
          </>
        }
        confirmLabel="Delete skill"
        onConfirm={() => (target ? remove(target) : Promise.resolve())}
        onConfirmed={() => setTarget(null)}
      />
    </div>
  );
}
