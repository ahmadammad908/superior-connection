import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { cloudinary } from "../../../lib/cloudinary";

function generateUploadSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: "superior-connection/admin",
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ""
  );
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    folder: paramsToSign.folder,
  };
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(generateUploadSignature());
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
