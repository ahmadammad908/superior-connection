import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../lib/auth";
import { uploadToCloudinary } from "../../lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireUser(true);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("type") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mime = file.type;
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and videos are supported." },
        { status: 400 }
      );
    }

    // Size limits: Images <= 10MB, Videos <= 60MB
    const maxSizeBytes = isVideo ? 60 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          error: `File size exceeds the limit (${
            isVideo ? "60MB for videos" : "10MB for images"
          }).`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = isVideo
      ? "superior-connection/videos"
      : "superior-connection/images";

    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      resource_type: isVideo ? "video" : "image",
    });

    return NextResponse.json({
      url: uploadResult.url,
      resourceType: uploadResult.resourceType,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
