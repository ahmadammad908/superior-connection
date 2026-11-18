import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireUser, handleApiError } from "../../../lib/auth";
import Conversation from "../../../models/Conversation";
import Message from "../../../models/Message";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or you are not authorized to delete it." },
        { status: 404 }
      );
    }

    // Permanently remove all messages belonging to this conversation from the database
    await Message.deleteMany({ conversationId: id });

    // Permanently remove the conversation itself from the database
    await Conversation.deleteOne({ _id: id });

    return NextResponse.json({
      message: "Conversation and messages permanently deleted from database.",
      conversationId: id,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to delete conversation.");
  }
}
