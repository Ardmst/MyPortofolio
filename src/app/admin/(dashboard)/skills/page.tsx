import Link from "next/link";
import { Plus, Sparkles, Star } from "lucide-react";
import { SkillsManager } from "@/components/admin/skills-manager";
import { Button } from "@/components/ui/button";
import { listSkills } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const skills = await listSkills();
  const total = skills.reduce((sum, skill) => sum + skill.proficiency, 0);
  const average = skills.length > 0 ? Math.round(total / skills.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
            {"// skills"}
          </p>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            <Sparkles className="size-6 text-accent" />
            Skills Manager
          </h1>
          <p className="text-sm text-fg-muted">
            Manage the entries that drive the public <Link href="/#skills" className="text-accent-soft hover:underline">skill matrix</Link>.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-edge bg-surface/60 px-4 py-3">
          <Star className="size-4 text-accent" />
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
              avg proficiency
            </p>
            <p className="font-display text-lg font-semibold text-fg">
              {average} <span className="text-sm font-normal text-fg-subtle">/ {skills.length} skills</span>
            </p>
          </div>
        </div>
      </div>

      <SkillsManager skills={skills} />
    </div>
  );
}
