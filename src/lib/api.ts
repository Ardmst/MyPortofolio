import "server-only";
import { NextResponse } from "next/server";
import { RepositoryError } from "@/lib/data/errors";

/**
 * JSON error response for a route handler.
 *
 * Only a `RepositoryError` carries a message meant for the caller. Anything
 * else (filesystem, network, a bug) is logged here and answered with the
 * route's own generic sentence — never with `error.message`.
 */
export function errorResponse(error: unknown, fallback: string): NextResponse {
  if (error instanceof RepositoryError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(`[api] ${fallback}`, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
