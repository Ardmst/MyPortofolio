import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { RepositoryError, deleteSkill, updateSkill } from "@/lib/data/repository";
import { getAdminUser } from "@/lib/auth/admin";
import { normalizeIdentifier, validateSkill } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** PUT /api/skills/[id] — admin only. */
export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const identifier = normalizeIdentifier(id);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid skill id." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateSkill(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: "Validation failed.", errors: validated.errors }, { status: 422 });
  }

  try {
    const skill = await updateSkill(identifier, validated.value);
    revalidatePath("/");
    return NextResponse.json({ data: skill });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update the skill." },
      { status },
    );
  }
}

/** DELETE /api/skills/[id] — admin only. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const identifier = normalizeIdentifier(id);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid skill id." }, { status: 400 });
  }

  try {
    await deleteSkill(identifier);
    revalidatePath("/");
    return NextResponse.json({ data: { id: identifier } });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete the skill." },
      { status },
    );
  }
}
