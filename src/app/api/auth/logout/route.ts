import { NextResponse } from "next/server";
import { signOutAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — clears the admin session. */
export async function POST() {
  await signOutAdmin();
  return NextResponse.json({ data: { signedOut: true } });
}
