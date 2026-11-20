import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createSkill, listSkills } from "@/lib/data/repository";
import { errorResponse } from "@/lib/api";
import { getAdminUser } from "@/lib/auth/admin";
import { validateSkill } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/skills — the toolbox.
 *
 * The schema carries a proficiency number, but it is a neutral placeholder and
 * is never shown publicly: only a signed-in admin (the CMS) receives it.
 */
export async function GET() {
  try {
    const skills = await listSkills();
    const admin = await getAdminUser();
    const data = admin
      ? skills
      : skills.map(({ id, name, category, icon_name, display_order }) => ({
          id,
          name,
          category,
          icon_name,
          display_order,
        }));
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    return errorResponse(error, "Failed to load skills.");
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
    return errorResponse(error, "Failed to create the skill.");
  }
}
