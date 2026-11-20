import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteProject, getProject, updateProject } from "@/lib/data/repository";
import { errorResponse } from "@/lib/api";
import { getAdminUser } from "@/lib/auth/admin";
import { normalizeIdentifier, validateProject } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * `[slugOrId]` serves both PRD endpoints:
 *   GET    /api/projects/[slug]  → public detail
 *   PUT    /api/projects/[id]    → admin update
 *   DELETE /api/projects/[id]    → admin delete
 * A single dynamic segment is required because Next.js cannot host two
 * different dynamic folders at the same level.
 */
type RouteContext = { params: Promise<{ slugOrId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slugOrId } = await context.params;
  const identifier = normalizeIdentifier(slugOrId);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 });
  }

  try {
    const project = await getProject(identifier);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (error) {
    return errorResponse(error, "Failed to load the project.");
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slugOrId } = await context.params;
  const identifier = normalizeIdentifier(slugOrId);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 });
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
    const project = await updateProject(identifier, validated.value);
    revalidatePath("/");
    return NextResponse.json({ data: project });
  } catch (error) {
    return errorResponse(error, "Failed to update the project.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slugOrId } = await context.params;
  const identifier = normalizeIdentifier(slugOrId);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 });
  }

  try {
    const removed = await deleteProject(identifier);
    revalidatePath("/");
    return NextResponse.json({ data: removed });
  } catch (error) {
    return errorResponse(error, "Failed to delete the project.");
  }
}
