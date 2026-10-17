import { NextResponse, type NextRequest } from "next/server";
import { RepositoryError, deleteMessage, setMessageRead } from "@/lib/data/repository";
import { getAdminUser } from "@/lib/auth/admin";
import { normalizeIdentifier } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/messages/[id] — mark read / unread (admin only). */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const identifier = normalizeIdentifier(id);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid message id." }, { status: 400 });
  }

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const isRead = Boolean((payload as { is_read?: unknown })?.is_read);

  try {
    const message = await setMessageRead(identifier, isRead);
    return NextResponse.json({ data: message });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update the message." },
      { status },
    );
  }
}

/** DELETE /api/messages/[id] — admin only. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const identifier = normalizeIdentifier(id);
  if (!identifier) {
    return NextResponse.json({ error: "Invalid message id." }, { status: 400 });
  }

  try {
    await deleteMessage(identifier);
    return NextResponse.json({ data: { id: identifier } });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete the message." },
      { status },
    );
  }
}
