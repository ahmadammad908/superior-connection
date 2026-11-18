import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import Post from "../../../../models/Post";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";

    const body = await req.json().catch(() => ({}));
    const scope = body.scope; // "global" | "profile" | undefined

    if (scope === "global" || (!scope && isAdmin)) {
      // Global feed pinning: ONLY admin can pin to the global campus feed
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Only administrators can pin posts to the global campus feed." },
          { status: 403 }
        );
      }
      post.isPinned = !post.isPinned;
      await post.save();

      return NextResponse.json({
        message: post.isPinned
          ? "Post pinned to global campus feed."
          : "Post unpinned from global feed.",
        isPinned: post.isPinned,
        isProfilePinned: Boolean(post.isProfilePinned),
        scope: "global",
      });
    }

    // Profile feed pinning: Simple users can pin their own posts to their profile
    const isAuthor = post.authorId === userId;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "You can only pin your own posts to your profile." },
        { status: 403 }
      );
    }

    post.isProfilePinned = !post.isProfilePinned;
    await post.save();

    return NextResponse.json({
      message: post.isProfilePinned
        ? "Post pinned to your profile feed."
        : "Post unpinned from your profile.",
      isPinned: post.isPinned,
      isProfilePinned: post.isProfilePinned,
      scope: "profile",
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
