import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";
import Post from "../../../../models/Post";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    return NextResponse.json({
      message: post.isPinned ? "Post pinned to top" : "Post unpinned",
      isPinned: post.isPinned,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/posts/[id]/pin error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update pinned state." },
      { status: 500 }
    );
  }
}
