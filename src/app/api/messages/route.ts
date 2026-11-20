import { NextResponse, type NextRequest } from "next/server";
import { createMessage, listMessages } from "@/lib/data/repository";
import { errorResponse } from "@/lib/api";
import { getAdminUser } from "@/lib/auth/admin";
import { RateLimiter, clientAddress } from "@/lib/rate-limit";
import { validateMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Messages one client address may send inside ten minutes. */
const perClient = new RateLimiter(5, 10 * 60 * 1000);
/** Messages accepted in total inside one hour, whatever the address. */
const overall = new RateLimiter(60, 60 * 60 * 1000, 1);

/** POST /api/messages — public contact form submission. */
export async function POST(request: NextRequest) {
  const client = clientAddress(request);
  const blockedFor = Math.max(perClient.retryAfter(client), overall.retryAfter("all"));
  if (blockedFor > 0) {
    return NextResponse.json(
      { error: "Too many messages. Try again later." },
      { status: 429, headers: { "Retry-After": String(blockedFor) } },
    );
  }

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

  perClient.hit(client);
  overall.hit("all");

  try {
    const message = await createMessage(validated.value);
    return NextResponse.json({ data: { id: message.id, created_at: message.created_at } }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to send the message.");
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
    return errorResponse(error, "Failed to load messages.");
  }
}
