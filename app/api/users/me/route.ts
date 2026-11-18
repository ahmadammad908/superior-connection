import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "../../../lib/db";
import { getCurrentUser, requireUser, handleApiError } from "../../../lib/auth";
import User from "../../../models/User";
import Post from "../../../models/Post";

export async function GET() {
  try {
    const authData = await getCurrentUser(true);
    if (!authData) {
      return NextResponse.json({ user: null });
    }

    const { user, userId } = authData;
    const postsCount = await Post.countDocuments({
      authorId: userId,
      isDeleted: false,
    });

    const isAdmin =
      userId === process.env.ADMIN_CLERK_USER_ID || user.role === "admin";

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        clerkId: user.clerkId,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        department: user.department,
        semester: user.semester,
        role: user.role,
        isAdmin,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedUntil: user.bannedUntil,
        savedPostsCount: user.savedPosts?.length || 0,
        postsCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch user profile.");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();

    const body = await req.json();
    const { name, username, bio, department, semester, avatar } = body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Name cannot be empty." },
          { status: 400 }
        );
      }
      dbUser.name = trimmedName;
    }

    if (username !== undefined) {
      const cleanUsername = username
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, "");

      if (cleanUsername.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters." },
          { status: 400 }
        );
      }

      if (cleanUsername !== dbUser.username) {
        const existing = await User.findOne({ username: cleanUsername });
        if (existing) {
          return NextResponse.json(
            { error: "Username is already taken." },
            { status: 409 }
          );
        }
        dbUser.username = cleanUsername;
      }
    }

    if (bio !== undefined) {
      dbUser.bio = bio.trim().slice(0, 300);
    }

    if (department !== undefined) {
      dbUser.department = department.trim().slice(0, 100);
    }

    if (semester !== undefined) {
      dbUser.semester = semester.trim().slice(0, 50);
    }

    if (avatar !== undefined) {
      dbUser.avatar = avatar;
    }

    await dbUser.save();

    // Sync with Clerk account so Clerk profile is also updated
    try {
      const client = await clerkClient();
      const clerkPayload: Record<string, any> = {};

      if (name !== undefined) {
        const parts = dbUser.name.split(" ");
        clerkPayload.firstName = parts[0] || dbUser.name;
        clerkPayload.lastName = parts.slice(1).join(" ") || "";
      }

      if (username !== undefined && dbUser.username) {
        clerkPayload.username = dbUser.username;
      }

      if (Object.keys(clerkPayload).length > 0) {
        await client.users.updateUser(userId, clerkPayload);
      }
    } catch (clerkErr: any) {
      console.warn("Clerk server sync warning:", clerkErr?.message);
    }

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        _id: dbUser._id.toString(),
        name: dbUser.name,
        username: dbUser.username,
        avatar: dbUser.avatar,
        bio: dbUser.bio,
        department: dbUser.department,
        semester: dbUser.semester,
        role: dbUser.role,
      },
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to update profile.");
  }
}
