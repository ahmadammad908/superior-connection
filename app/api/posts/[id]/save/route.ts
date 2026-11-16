import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import User from "../../../../models/User";
import Post from "../../../../models/Post";
import mongoose from "mongoose";

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

    const objectId = new mongoose.Types.ObjectId(id);
    const isAlreadySaved = user.savedPosts.some(
      (savedId) => savedId.toString() === id
    );

    let saved = false;
    if (isAlreadySaved) {
      await User.updateOne(
        { clerkId: userId },
        { $pull: { savedPosts: objectId } }
      );
      saved = false;
    } else {
      await User.updateOne(
        { clerkId: userId },
        { $addToSet: { savedPosts: objectId } }
      );
      saved = true;
    }

    return NextResponse.json({ saved });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/posts/[id]/save error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update bookmark." },
      { status: 500 }
    );
  }
}
