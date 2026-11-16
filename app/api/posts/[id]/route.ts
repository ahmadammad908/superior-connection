import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { getCurrentUser, requireUser } from "../../../lib/auth";
import Post from "../../../models/Post";
import { POST_CATEGORIES } from "../../../lib/constants";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const authData = await getCurrentUser(false);
    const currentUserId = authData?.userId || null;
    const isAdmin =
      currentUserId === process.env.ADMIN_CLERK_USER_ID ||
      authData?.user?.role === "admin";

    const post = await Post.findOne({ _id: id, isDeleted: false })
      .populate("author", "name username avatar department semester role")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = currentUserId ? post.likes?.includes(currentUserId) : false;
    let isSaved = false;
    if (authData?.user?.savedPosts) {
      isSaved = authData.user.savedPosts.some(
        (sp: any) => sp.toString() === post._id.toString()
      );
    }
    const isAuthor = currentUserId === post.authorId;

    const author: any = post.author || {};
    let displayAuthor = {
      name: author.name || "Student",
      username: author.username || "student",
      avatar: author.avatar || "",
      department: author.department || "",
      semester: author.semester || "",
      role: author.role || "student",
    };

    let realAuthor = undefined;
    if (post.isAnonymous) {
      if (isAdmin) {
        realAuthor = {
          name: author.name || "Unknown",
          username: author.username || "unknown",
          clerkId: post.authorId,
        };
      }
      displayAuthor = {
        name: "Anonymous Student",
        username: "anonymous",
        avatar: "",
        department: "Campus",
        semester: "",
        role: "student",
      };
    }

    return NextResponse.json({
      post: {
        _id: post._id.toString(),
        authorId: post.authorId,
        author: displayAuthor,
        realAuthor,
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
        isSaved,
        isAuthor,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("GET /api/posts/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch post." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";
    if (post.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit someone else's post." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, category } = body;

    if (content !== undefined) {
      const trimmed = content.trim();
      if (!trimmed && post.images.length === 0 && !post.video) {
        return NextResponse.json(
          { error: "Post cannot be empty." },
          { status: 400 }
        );
      }
      post.content = trimmed;
      // Re-extract tags
      const rawTags: string[] = trimmed.match(/#[\w\d_]+/g) || [];
      post.tags = Array.from(new Set(rawTags.map((t) => t.toLowerCase())));
    }

    if (category && POST_CATEGORIES.includes(category)) {
      post.category = category;
    }

    await post.save();

    return NextResponse.json({
      message: "Post updated successfully",
      post: {
        _id: post._id.toString(),
        content: post.content,
        category: post.category,
        tags: post.tags,
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("PUT /api/posts/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update post." },
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

    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";
    if (post.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete someone else's post." },
        { status: 403 }
      );
    }

    post.isDeleted = true;
    await post.save();

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/posts/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete post." },
      { status: 500 }
    );
  }
}
