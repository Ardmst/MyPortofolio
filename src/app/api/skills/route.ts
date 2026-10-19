import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { RepositoryError, createSkill, listSkills } from "@/lib/data/repository";
import { getAdminUser } from "@/lib/auth/admin";
import { validateSkill } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/skills — public listing that backs the skill matrix. */
export async function GET() {
  try {
    const skills = await listSkills();
    return NextResponse.json({ data: skills, count: skills.length });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load skills." },
      { status },
    );
  }
}

/** POST /api/skills — admin only. */
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

  const validated = validateSkill(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: "Validation failed.", errors: validated.errors }, { status: 422 });
  }

  try {
    const skill = await createSkill(validated.value);
    // The public homepage renders the skill matrix — keep it fresh.
    revalidatePath("/");
    return NextResponse.json({ data: skill }, { status: 201 });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create the skill." },
      { status },
    );
  }
}
