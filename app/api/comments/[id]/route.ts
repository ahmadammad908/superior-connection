import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import Comment from "../../../models/Comment";
import Post from "../../../models/Post";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";
    if (comment.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit someone else's comment." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const trimmed = (body.body || "").trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 }
      );
    }

    if (trimmed.length > 1000) {
      return NextResponse.json(
        { error: "Comment cannot exceed 1000 characters." },
        { status: 400 }
      );
    }

    comment.body = trimmed;
    await comment.save();

    return NextResponse.json({
      message: "Comment updated",
      comment: {
        _id: comment._id.toString(),
        body: comment.body,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("PUT /api/comments/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update comment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";
    if (comment.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete someone else's comment." },
        { status: 403 }
      );
    }

    comment.isDeleted = true;
    await comment.save();

    // Decrement commentsCount on Post
    await Post.updateOne(
      { _id: comment.postId },
      { $inc: { commentsCount: -1 } }
    );

    return NextResponse.json({ message: "Comment deleted successfully." });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/comments/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete comment." },
      { status: 500 }
    );
  }
}
