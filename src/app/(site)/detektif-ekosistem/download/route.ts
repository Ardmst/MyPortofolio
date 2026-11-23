import { NextResponse } from "next/server";

const DIRECT_DOWNLOAD_URL =
  "https://drive.usercontent.google.com/download?id=1vG9aKz4sgGhr4X1aoxixbJWitFqMHBbx&export=download&confirm=t";

export function GET() {
  return NextResponse.redirect(DIRECT_DOWNLOAD_URL, 302);
}
