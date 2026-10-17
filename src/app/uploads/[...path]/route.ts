import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { LOCAL_UPLOAD_DIR } from "@/lib/data/local-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Streams media uploaded while the app runs in local fallback mode.
 * Supabase mode returns absolute Storage URLs, so this route is only hit by
 * `/uploads/...` paths produced by `uploadMedia()` in `repository.ts`.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;

  // Reject anything that is not a plain file name — no traversal, no nesting
  // escapes, no empty segments.
  if (
    !segments ||
    segments.length === 0 ||
    segments.some((segment) => !/^[A-Za-z0-9._-]+$/.test(segment) || segment.startsWith("."))
  ) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  const target = path.join(LOCAL_UPLOAD_DIR, ...segments);

  // Defence in depth: the resolved path must stay inside the upload dir.
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(LOCAL_UPLOAD_DIR) + path.sep)) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  let stat;
  try {
    stat = await fs.stat(resolved);
  } catch {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  if (!stat.isFile()) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(resolved).toLowerCase()] ?? "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(resolved)) as ReadableStream<Uint8Array>;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
