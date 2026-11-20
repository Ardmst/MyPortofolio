import { NextResponse, type NextRequest } from "next/server";
import { uploadMedia } from "@/lib/data/repository";
import { errorResponse } from "@/lib/api";
import { getAdminUser } from "@/lib/auth/admin";
import { dataMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/upload — admin only media uploader (multipart/form-data). */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  const single = formData.get("file");
  if (single instanceof File) files.push(single);

  if (files.length === 0) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }

  try {
    const uploaded = [];
    for (const file of files) {
      uploaded.push(await uploadMedia(file));
    }
    return NextResponse.json({ data: uploaded, mode: dataMode() }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to upload the file.");
  }
}
