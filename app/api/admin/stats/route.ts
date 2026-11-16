import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAdmin, handleApiError } from "../../../lib/auth";
import User from "../../../models/User";
import Post from "../../../models/Post";
import Comment from "../../../models/Comment";
import Report from "../../../models/Report";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalReports,
      pendingReports,
      bannedUsers,
      recentPosts,
      recentReports,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      User.countDocuments({ isBanned: true }),
      Post.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "name username")
        .lean(),
      Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalReports,
        pendingReports,
        bannedUsers,
      },
      recentPosts: recentPosts.map((p: any) => ({
        _id: p._id.toString(),
        authorName: p.author?.name || "Student",
        content: p.content?.slice(0, 80),
        category: p.category,
        createdAt: p.createdAt,
      })),
      recentReports: recentReports.map((r: any) => ({
        _id: r._id.toString(),
        reporterName: r.reporterName,
        targetType: r.targetType,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch admin stats.");
  }
}
