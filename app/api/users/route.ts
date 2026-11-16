import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { requireUser, handleApiError } from "../../lib/auth";
import User from "../../models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(true);
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const query = (searchParams.get("query") || searchParams.get("q") || "").trim();

    const filter: Record<string, any> = {
      clerkId: { $ne: userId },
      isBanned: false,
    };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("clerkId name username avatar department semester role")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ users });
  } catch (err: any) {
    return handleApiError(err, "Failed to search students.");
  }
}
