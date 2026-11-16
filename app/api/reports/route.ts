import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { requireUser } from "../../lib/auth";
import Report, { REPORT_REASONS } from "../../models/Report";
import Post from "../../models/Post";
import Comment from "../../models/Comment";
import User from "../../models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();

    const body = await req.json();
    const { targetType, targetId, reason, details } = body;

    if (!targetType || !["post", "comment", "user"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type." },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { error: "targetId is required." },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required." },
        { status: 400 }
      );
    }

    let postId = undefined;
    let commentId = undefined;
    let reportedUserId = "";

    if (targetType === "post") {
      const p = await Post.findById(targetId);
      if (!p) {
        return NextResponse.json(
          { error: "Reported post not found." },
          { status: 404 }
        );
      }
      postId = p._id;
      reportedUserId = p.authorId;
    } else if (targetType === "comment") {
      const c = await Comment.findById(targetId);
      if (!c) {
        return NextResponse.json(
          { error: "Reported comment not found." },
          { status: 404 }
        );
      }
      commentId = c._id;
      reportedUserId = c.authorId;
    } else if (targetType === "user") {
      const u = await User.findOne({
        $or: [{ clerkId: targetId }, { username: targetId.toLowerCase() }],
      });
      reportedUserId = u ? u.clerkId : targetId;
    }

    const report = await Report.create({
      reporterId: userId,
      reporterName: user.name,
      targetType,
      targetId,
      postId,
      commentId,
      reportedUserId,
      reason,
      details: (details || "").trim().slice(0, 500),
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully. University moderators will review it.",
        reportId: report._id.toString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/reports error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit report." },
      { status: 500 }
    );
  }
}
