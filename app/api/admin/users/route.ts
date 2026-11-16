import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAdmin, handleApiError } from "../../../lib/auth";
import User from "../../../models/User";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const banned = searchParams.get("banned");

    const filter: any = {};
    if (banned === "true") {
      filter.isBanned = true;
    } else if (banned === "false") {
      filter.isBanned = false;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { department: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = users.map((u: any) => ({
      _id: u._id.toString(),
      clerkId: u.clerkId,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      department: u.department,
      semester: u.semester,
      role: u.role,
      isBanned: u.isBanned,
      banReason: u.banReason,
      bannedUntil: u.bannedUntil,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: formatted });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch users.");
  }
}
