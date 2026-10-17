import { NextResponse, type NextRequest } from "next/server";
import { RepositoryError, createMessage, listMessages } from "@/lib/data/repository";
import { getAdminUser } from "@/lib/auth/admin";
import { validateMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/messages — public contact form submission. */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateMessage(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: "Validation failed.", errors: validated.errors }, { status: 422 });
  }

  try {
    const message = await createMessage(validated.value);
    return NextResponse.json({ data: { id: message.id, created_at: message.created_at } }, { status: 201 });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send the message." },
      { status },
    );
  }
}

/** GET /api/messages — admin only inbox listing. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const messages = await listMessages();
    return NextResponse.json({
      data: messages,
      count: messages.length,
      unread: messages.filter((message) => !message.is_read).length,
    });
  } catch (error) {
    const status = error instanceof RepositoryError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load messages." },
      { status },
    );
  }
}
