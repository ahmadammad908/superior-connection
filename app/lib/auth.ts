import { auth, currentUser } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import User, { IUser } from "../models/User";

export function handleApiError(
  err: any,
  fallbackMessage = "An unexpected server error occurred."
) {
  if (
    err?.digest?.includes("NEXT_") ||
    err?.digest === "HANGING_PROMISE_REJECTION" ||
    (typeof err?.message === "string" &&
      err.message.includes("During prerendering"))
  ) {
    throw err;
  }
  if (err instanceof Response) return err;
  console.error("API Error:", err);
  return NextResponse.json(
    { error: err?.message || fallbackMessage },
    { status: 500 }
  );
}

export async function getCurrentUser(syncIfMissing = true): Promise<{
  userId: string;
  user: IUser;
} | null> {
  await connection();
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();
  let user = await User.findOne({ clerkId: userId });

  if (!user && syncIfMissing) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const baseName =
        clerkUser.fullName ||
        clerkUser.firstName ||
        email.split("@")[0] ||
        "Student";
      let baseUsername =
        clerkUser.username ||
        email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() ||
        `student_${userId.slice(-6).toLowerCase()}`;

      // Ensure unique username
      let finalUsername = baseUsername;
      let counter = 1;
      while (await User.exists({ username: finalUsername })) {
        finalUsername = `${baseUsername}${counter++}`;
      }

      const isAdminUser = userId === process.env.ADMIN_CLERK_USER_ID;

      user = await User.create({
        clerkId: userId,
        name: baseName,
        username: finalUsername,
        avatar: clerkUser.imageUrl || "",
        bio: "",
        department: "",
        semester: "",
        role: isAdminUser ? "admin" : "student",
        isBanned: false,
        savedPosts: [],
      });
    }
  }

  if (user) {
    // If admin env var matches, make sure role is admin
    if (userId === process.env.ADMIN_CLERK_USER_ID && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Check temporary suspension expiry
    if (user.isBanned && user.bannedUntil) {
      const now = new Date();
      if (new Date(user.bannedUntil) <= now) {
        user.isBanned = false;
        user.bannedUntil = null;
        user.banReason = "";
        await user.save();
      }
    }
  }

  if (!user) return null;
  return { userId, user };
}

export async function requireUser(checkBan = true): Promise<{
  userId: string;
  user: IUser;
}> {
  const authData = await getCurrentUser(true);
  if (!authData) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized. Please sign in." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (checkBan && authData.user.isBanned) {
    throw new Response(
      JSON.stringify({
        error: "Your account is currently suspended or banned.",
        banReason: authData.user.banReason || "Violation of campus guidelines",
        bannedUntil: authData.user.bannedUntil,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return authData;
}

export async function requireAdmin(): Promise<{
  userId: string;
  user: IUser;
}> {
  const authData = await requireUser(false);
  const isAdmin =
    authData.userId === process.env.ADMIN_CLERK_USER_ID ||
    authData.user.role === "admin";

  if (!isAdmin) {
    throw new Response(
      JSON.stringify({ error: "Forbidden: Admin access required." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return authData;
}
