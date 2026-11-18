import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { getCurrentUser, requireUser } from "../../lib/auth";
import Post from "../../models/Post";
import User from "../../models/User";
import { POST_CATEGORIES, PostCategory } from "../../lib/constants";


export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "latest";
    const q = searchParams.get("q")?.trim();
    const username = searchParams.get("username")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const authData = await getCurrentUser(false);
    const currentUserId = authData?.userId || null;
    const isAdmin =
      currentUserId === process.env.ADMIN_CLERK_USER_ID ||
      authData?.user?.role === "admin";

    // Build filter query
    const filter: any = { isDeleted: false };

    if (category && category !== "All" && POST_CATEGORIES.includes(category as PostCategory)) {
      filter.category = category;
    }

    if (q) {
      const isHashtag = q.startsWith("#");
      const cleanTag = isHashtag ? q.toLowerCase() : `#${q.toLowerCase()}`;
      filter.$or = [
        { content: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { tags: cleanTag },
        { tags: q.toLowerCase() },
      ];
    }

    if (username) {
      const targetUser = await User.findOne({ username: username.toLowerCase() });
      if (targetUser) {
        filter.authorId = targetUser.clerkId;
      } else {
        return NextResponse.json({ posts: [], hasMore: false, total: 0 });
      }
    }

    // Build sort
    // For profile feeds, user's profile-pinned posts appear first
    // For global feed, only admin-pinned posts appear first
    const sortOptions: any = {};
    if (username) {
      sortOptions.isProfilePinned = -1;
      sortOptions.isPinned = -1;
      sortOptions.createdAt = -1;
    } else {
      sortOptions.isPinned = -1;
      if (sort === "trending") {
        sortOptions.likesCount = -1;
        sortOptions.commentsCount = -1;
        sortOptions.createdAt = -1;
      } else {
        sortOptions.createdAt = -1;
      }
    }

    const fetchLimit = limit + 1;
    const postsPromise = Post.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(fetchLimit)
      .populate("author", "name username avatar department semester role")
      .lean();

    const [rawPosts, totalCount] = await Promise.all([
      postsPromise,
      page === 1 ? Post.countDocuments(filter) : Promise.resolve(-1),
    ]);

    const hasMore = rawPosts.length > limit;
    const posts = hasMore ? rawPosts.slice(0, limit) : rawPosts;
    const total = totalCount >= 0 ? totalCount : skip + posts.length + (hasMore ? 1 : 0);

    // Check user's saved posts
    let savedPostIds = new Set<string>();
    if (authData?.user?.savedPosts) {
      savedPostIds = new Set(
        authData.user.savedPosts.map((id: any) => id.toString())
      );
    }

    const formattedPosts = posts.map((post: any) => {
      const author = post.author || {};
      const isLiked = currentUserId ? post.likes?.includes(currentUserId) : false;
      const isSaved = savedPostIds.has(post._id.toString());
      const isAuthor = currentUserId === post.authorId;

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
          // Admin can see real author
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

      return {
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
        isProfilePinned: Boolean(post.isProfilePinned),
        isAnnouncement: post.isAnnouncement,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        isLiked,
        isSaved,
        isAuthor,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      hasMore: skip + posts.length < total,
      total,
      page,
    });
  } catch (err: any) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch posts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();

    const body = await req.json();
    const {
      content,
      images = [],
      video = "",
      category = "Other",
      isAnonymous = false,
      isAnnouncement = false,
      isPinned = false,
    } = body;

    const trimmedContent = (content || "").trim();
    if (!trimmedContent && images.length === 0 && !video) {
      return NextResponse.json(
        { error: "Post must have text or media." },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 4000) {
      return NextResponse.json(
        { error: "Post content cannot exceed 4000 characters." },
        { status: 400 }
      );
    }

    if (images.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 images allowed per post." },
        { status: 400 }
      );
    }

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";

    // Only admin can post official announcements or pin directly
    const finalIsAnnouncement = isAdmin ? Boolean(isAnnouncement) : false;
    const finalIsPinned = isAdmin ? Boolean(isPinned) : false;

    // Extract hashtags like #hostel #fees
    const rawTags: string[] = trimmedContent.match(/#[\w\d_]+/g) || [];
    const tags = Array.from(new Set(rawTags.map((t) => t.toLowerCase())));

    const validCategory = POST_CATEGORIES.includes(category) ? category : "Other";

    const newPost = await Post.create({
      authorId: userId,
      author: user._id,
      content: trimmedContent,
      images: Array.isArray(images) ? images.slice(0, 4) : [],
      video: typeof video === "string" ? video : "",
      category: validCategory,
      tags,
      isAnonymous: Boolean(isAnonymous),
      isAnnouncement: finalIsAnnouncement,
      isPinned: finalIsPinned,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      isDeleted: false,
    });

    const displayAuthor = Boolean(isAnonymous)
      ? {
          name: "Anonymous Student",
          username: "anonymous",
          avatar: "",
          department: "Campus",
          semester: "",
          role: "student",
        }
      : {
          name: user.name || "Student",
          username: user.username || "student",
          avatar: user.avatar || "",
          department: user.department || "",
          semester: user.semester || "",
          role: user.role || "student",
        };

    const realAuthor = Boolean(isAnonymous) && isAdmin
      ? {
          name: user.name || "Unknown",
          username: user.username || "unknown",
          clerkId: userId,
        }
      : undefined;

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          _id: newPost._id.toString(),
          authorId: newPost.authorId,
          author: displayAuthor,
          realAuthor,
          content: newPost.content,
          images: newPost.images,
          video: newPost.video,
          category: newPost.category,
          tags: newPost.tags,
          isAnonymous: newPost.isAnonymous,
          isAnnouncement: newPost.isAnnouncement,
          isPinned: newPost.isPinned,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          isSaved: false,
          isAuthor: true,
          createdAt: newPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/posts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create post." },
      { status: 500 }
    );
  }
}
