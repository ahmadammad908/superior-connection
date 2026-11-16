import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { requireUser, handleApiError } from "../../lib/auth";
import Notification from "../../models/Notification";

export async function GET() {
  try {
    const { userId } = await requireUser(false);
    await connectDB();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      Notification.countDocuments({ recipientId: userId, read: false }),
    ]);

    const formatted = notifications.map((n: any) => ({
      _id: n._id.toString(),
      actorName: n.actorName,
      actorImage: n.actorImage,
      type: n.type,
      postId: n.postId ? n.postId.toString() : null,
      commentId: n.commentId ? n.commentId.toString() : null,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({ notifications: formatted, unreadCount });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch notifications.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireUser(false);
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await Notification.updateOne(
        { _id: notificationId, recipientId: userId },
        { $set: { read: true } }
      );
    } else {
      // Mark all read
      await Notification.updateMany(
        { recipientId: userId, read: false },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ message: "Notifications marked as read." });
  } catch (err: any) {
    return handleApiError(err, "Failed to mark notifications.");
  }
}
