import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAdmin, handleApiError } from "../../../lib/auth";
import Report from "../../../models/Report";
import Post from "../../../models/Post";
import Comment from "../../../models/Comment";
import User from "../../../models/User";
import Notification from "../../../models/Notification";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "postId",
        select: "content images video category isDeleted authorId",
      })
      .populate({
        path: "commentId",
        select: "body isDeleted authorId authorName",
      })
      .lean();

    const formatted = reports.map((r: any) => ({
      _id: r._id.toString(),
      reporterId: r.reporterId,
      reporterName: r.reporterName,
      targetType: r.targetType,
      targetId: r.targetId,
      post: r.postId,
      comment: r.commentId,
      reportedUserId: r.reportedUserId,
      reason: r.reason,
      details: r.details,
      status: r.status,
      actionTaken: r.actionTaken,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ reports: formatted });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch reports.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId: adminUserId } = await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { reportId, action, notes, durationDays } = body;

    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    if (action === "dismiss") {
      report.status = "dismissed";
      report.actionTaken = notes || "Dismissed by admin";
      await report.save();
      return NextResponse.json({ message: "Report dismissed.", report });
    }

    if (action === "delete_content") {
      if (report.targetType === "post" && report.postId) {
        await Post.updateOne({ _id: report.postId }, { isDeleted: true });
      } else if (report.targetType === "comment" && report.commentId) {
        const comment = await Comment.findById(report.commentId);
        if (comment) {
          comment.isDeleted = true;
          await comment.save();
          await Post.updateOne(
            { _id: comment.postId },
            { $inc: { commentsCount: -1 } }
          );
        }
      }
      report.status = "resolved";
      report.actionTaken = "Content deleted by moderator";
      await report.save();
      return NextResponse.json({
        message: "Reported content removed and report marked as resolved.",
        report,
      });
    }

    if (action === "warn_user") {
      if (report.reportedUserId) {
        await Notification.create({
          recipientId: report.reportedUserId,
          actorId: adminUserId,
          actorName: "Superior Administration",
          type: "warning",
          message:
            notes ||
            `Official Warning: Your recent content was flagged for "${report.reason}". Please review campus community guidelines.`,
          read: false,
        });
      }
      report.status = "resolved";
      report.actionTaken = `Warning issued: ${notes || report.reason}`;
      await report.save();
      return NextResponse.json({
        message: "Warning issued to student.",
        report,
      });
    }

    if (action === "ban_user") {
      if (report.reportedUserId) {
        const user = await User.findOne({ clerkId: report.reportedUserId });
        if (user && user.clerkId !== adminUserId) {
          user.isBanned = true;
          user.banReason = notes || `Reported for ${report.reason}`;
          if (durationDays && Number(durationDays) > 0) {
            const until = new Date();
            until.setDate(until.getDate() + Number(durationDays));
            user.bannedUntil = until;
          } else {
            user.bannedUntil = null;
          }
          await user.save();

          await Notification.create({
            recipientId: user.clerkId,
            actorId: adminUserId,
            actorName: "Superior Administration",
            type: "warning",
            message: `Your account has been suspended. Reason: ${user.banReason}`,
            read: false,
          });
        }
      }
      report.status = "resolved";
      report.actionTaken = `User banned: ${notes || report.reason}`;
      await report.save();
      return NextResponse.json({ message: "User suspended/banned.", report });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return handleApiError(err, "Failed to process report.");
  }
}
