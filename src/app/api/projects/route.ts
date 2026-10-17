import { NextResponse, type NextRequest } from "next/server";
import { RepositoryError, createProject, listProjects } from "@/lib/data/repository";
import { getAdminUser } from "@/lib/auth/admin";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/lib/types";
import { validateProject } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/projects?category=game — public listing. */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("category")?.trim() ?? "all";
  const category: ProjectCategory | "all" =
    requested === "all" || PROJECT_CATEGORIES.includes(requested as ProjectCategory)
      ? (requested as ProjectCategory | "all")
      : "all";

  try {
    const projects = await listProjects({ category });
    return NextResponse.json({ data: projects, count: projects.length, category });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load projects." },
      { status },
    );
  }
}

/** POST /api/projects — admin only. */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateProject(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: "Validation failed.", errors: validated.errors }, { status: 422 });
  }

  try {
    const project = await createProject(validated.value);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create the project." },
      { status },
    );
  }
}
