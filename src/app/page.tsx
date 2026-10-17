import { SiteHeader } from "@/components/portfolio/site-header";
import { HeroSection } from "@/components/portfolio/hero-section";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { SkillMatrix } from "@/components/portfolio/skill-matrix";
import { ContactForm } from "@/components/portfolio/contact-form";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { listProjects, listSkills } from "@/lib/data/repository";
import { SEED_PROJECTS, SEED_SKILLS } from "@/lib/data/seed";
import type { Project, Skill } from "@/lib/types";

// The gallery is CMS-driven, so always render fresh data.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: Project[] = [];
  let skills: Skill[] = [];

  try {
    [projects, skills] = await Promise.all([listProjects(), listSkills()]);
  } catch (error) {
    // Never let a backend hiccup blank the whole landing page.
    console.error("[home] falling back to seed data:", error);
    projects = SEED_PROJECTS;
    skills = SEED_SKILLS;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection skills={skills} projects={projects} />
        <ProjectGallery projects={projects} />
        <SkillMatrix skills={skills} />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
