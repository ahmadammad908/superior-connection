import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import Comment from "../../../../models/Comment";
import Notification from "../../../../models/Notification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const comment = await Comment.findOne({ _id: id, isDeleted: false });
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    const alreadyLiked = comment.likes.includes(userId);
    let liked = false;

    if (alreadyLiked) {
      await Comment.updateOne(
        { _id: id },
        {
          $pull: { likes: userId },
          $inc: { likesCount: -1 },
        }
      );
      liked = false;
    } else {
      await Comment.updateOne(
        { _id: id },
        {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 },
        }
      );
      liked = true;

      if (comment.authorId !== userId) {
        await Notification.create({
          recipientId: comment.authorId,
          actorId: userId,
          actorName: user.name,
          actorImage: user.avatar,
          type: "like_comment",
          postId: comment.postId,
          commentId: comment._id,
          message: `${user.name} liked your comment.`,
          read: false,
        });
      }
    }

    const updated = await Comment.findById(id).select("likesCount");

    return NextResponse.json({
      liked,
      likesCount: Math.max(0, updated?.likesCount || 0),
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/comments/[id]/like error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update comment like." },
      { status: 500 }
    );
  }
}
