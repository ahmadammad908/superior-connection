import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import Post from "../../../models/Post";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postsCount = await Post.countDocuments({
      authorId: user.clerkId,
      isDeleted: false,
      isAnonymous: false, // In public profile, only non-anonymous posts are listed
    });

    const totalLikesAgg = await Post.aggregate([
      { $match: { authorId: user.clerkId, isDeleted: false } },
      { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
    ]);
    const totalLikes = totalLikesAgg[0]?.totalLikes || 0;

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        department: user.department,
        semester: user.semester,
        role: user.role,
        isBanned: user.isBanned,
        postsCount,
        totalLikes,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("GET /api/users/[username] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch profile." },
      { status: 500 }
    );
  }
}
