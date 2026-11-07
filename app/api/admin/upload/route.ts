import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { generateUploadSignature } from "../../../lib/cloudinary";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(generateUploadSignature());
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}