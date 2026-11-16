import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { requireUser, handleApiError } from "../../lib/auth";
import User from "../../models/User";
import Post from "../../models/Post";

export async function GET() {
  try {
    const { userId } = await requireUser(false);
    await connectDB();

    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user || !user.savedPosts || user.savedPosts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await Post.find({
      _id: { $in: user.savedPosts },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar department semester role")
      .lean();

    const formattedPosts = posts.map((post: any) => {
      const author = post.author || {};
      const isLiked = post.likes?.includes(userId) || false;
      const isAuthor = userId === post.authorId;

      let displayAuthor = {
        name: author.name || "Student",
        username: author.username || "student",
        avatar: author.avatar || "",
        department: author.department || "",
        semester: author.semester || "",
        role: author.role || "student",
      };

      if (post.isAnonymous) {
        displayAuthor = {
          name: "Anonymous Student",
          username: "anonymous",
          avatar: "",
          department: "Campus",
          semester: "",
          role: "student",
        };
      }

      return {
        _id: post._id.toString(),
        authorId: post.authorId,
        author: displayAuthor,
        content: post.content,
        images: post.images || [],
        video: post.video || "",
        category: post.category,
        tags: post.tags || [],
        isAnonymous: post.isAnonymous,
        isPinned: post.isPinned,
        isAnnouncement: post.isAnnouncement,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        isLiked,
        isSaved: true,
        isAuthor,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch saved posts.");
  }
}
