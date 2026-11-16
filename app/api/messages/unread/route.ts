import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireUser, handleApiError } from "../../../lib/auth";
import Conversation from "../../../models/Conversation";

export async function GET() {
  try {
    const { userId } = await requireUser(false);
    await connectDB();

    const count = await Conversation.countDocuments({
      participants: userId,
      unreadBy: userId,
    });

    return NextResponse.json({ unreadCount: count });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch unread messages count.");
  }
}
