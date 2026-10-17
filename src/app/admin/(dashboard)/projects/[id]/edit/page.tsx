import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { getProject } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(decodeURIComponent(id));

  if (!project) notFound();

  return <ProjectForm mode="edit" project={project} />;
}
