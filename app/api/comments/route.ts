import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { getCurrentUser, requireUser } from "../../lib/auth";
import Comment from "../../models/Comment";
import Post from "../../models/Post";
import Notification from "../../models/Notification";


export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const authData = await getCurrentUser(false);
    const currentUserId = authData?.userId || null;
    const isAdmin =
      currentUserId === process.env.ADMIN_CLERK_USER_ID ||
      authData?.user?.role === "admin";

    const allComments = await Comment.find({
      postId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate("author", "name username avatar department semester role")
      .lean();

    const rootComments: any[] = [];
    const repliesMap = new Map<string, any[]>();

    allComments.forEach((c: any) => {
      const isLiked = currentUserId ? c.likes?.includes(currentUserId) : false;
      const isAuthor = currentUserId === c.authorId;
      const author = c.author || {};

      const formatted = {
        _id: c._id.toString(),
        postId: c.postId.toString(),
        authorId: c.authorId,
        author: {
          name: author.name || c.authorName || "Student",
          username: author.username || "student",
          avatar: author.avatar || c.authorImage || "",
          department: author.department || "",
          semester: author.semester || "",
          role: author.role || "student",
        },
        body: c.body,
        parentId: c.parentId ? c.parentId.toString() : null,
        replyToName: c.replyToName || "",
        likesCount: c.likesCount || 0,
        isLiked,
        isAuthor,
        canDelete: isAuthor || isAdmin,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };

      if (!formatted.parentId) {
        rootComments.push({ ...formatted, replies: [] });
      } else {
        const existing = repliesMap.get(formatted.parentId) || [];
        existing.push(formatted);
        repliesMap.set(formatted.parentId, existing);
      }
    });

    rootComments.forEach((root) => {
      root.replies = repliesMap.get(root._id) || [];
    });

    return NextResponse.json({ comments: rootComments });
  } catch (err: any) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();

    const body = await req.json();
    const { postId, body: commentText, parentId, replyToName } = body;

    const trimmed = (commentText || "").trim();
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

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    let parentComment: any = null;
    if (parentId) {
      parentComment = await Comment.findOne({
        _id: parentId,
        isDeleted: false,
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found." },
          { status: 404 }
        );
      }
    }

    const newComment = await Comment.create({
      postId,
      authorId: userId,
      author: user._id,
      authorName: user.name,
      authorImage: user.avatar,
      body: trimmed,
      parentId: parentId || null,
      replyToName: replyToName || (parentComment ? parentComment.authorName : ""),
      likes: [],
      likesCount: 0,
      isDeleted: false,
    });

    // Increment post commentsCount
    await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

    // Notifications
    if (parentId && parentComment && parentComment.authorId !== userId) {
      // Reply notification to parent comment author
      await Notification.create({
        recipientId: parentComment.authorId,
        actorId: userId,
        actorName: user.name,
        actorImage: user.avatar,
        type: "reply_comment",
        postId: post._id,
        commentId: newComment._id,
        message: `${user.name} replied to your comment.`,
        read: false,
      });
    } else if (post.authorId !== userId) {
      // Top level comment notification to post author
      await Notification.create({
        recipientId: post.authorId,
        actorId: userId,
        actorName: user.name,
        actorImage: user.avatar,
        type: "comment_post",
        postId: post._id,
        commentId: newComment._id,
        message: `${user.name} commented on your post.`,
        read: false,
      });
    }

    return NextResponse.json(
      {
        message: "Comment added",
        comment: {
          _id: newComment._id.toString(),
          postId: newComment.postId.toString(),
          authorId: newComment.authorId,
          author: {
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            department: user.department,
            semester: user.semester,
            role: user.role,
          },
          body: newComment.body,
          parentId: newComment.parentId
            ? newComment.parentId.toString()
            : null,
          replyToName: newComment.replyToName,
          likesCount: 0,
          isLiked: false,
          isAuthor: true,
          canDelete: true,
          replies: [],
          createdAt: newComment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to post comment." },
      { status: 500 }
    );
  }
}
