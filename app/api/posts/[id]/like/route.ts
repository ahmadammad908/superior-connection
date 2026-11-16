import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import Post from "../../../../models/Post";
import Notification from "../../../../models/Notification";

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

    const alreadyLiked = post.likes.includes(userId);
    let liked = false;

    if (alreadyLiked) {
      // Unlike
      await Post.updateOne(
        { _id: id },
        {
          $pull: { likes: userId },
          $inc: { likesCount: -1 },
        }
      );
      liked = false;
    } else {
      // Like
      await Post.updateOne(
        { _id: id },
        {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 },
        }
      );
      liked = true;

      // Create notification if liking someone else's post
      if (post.authorId !== userId) {
        await Notification.create({
          recipientId: post.authorId,
          actorId: userId,
          actorName: user.name,
          actorImage: user.avatar,
          type: "like_post",
          postId: post._id,
          message: `${user.name} liked your post.`,
          read: false,
        });
      }
    }

    const updatedPost = await Post.findById(id).select("likesCount");

    return NextResponse.json({
      liked,
      likesCount: Math.max(0, updatedPost?.likesCount || 0),
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/posts/[id]/like error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update like status." },
      { status: 500 }
    );
  }
}
