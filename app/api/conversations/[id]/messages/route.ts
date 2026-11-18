import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireUser, handleApiError } from "../../../../lib/auth";
import Conversation from "../../../../models/Conversation";
import Message from "../../../../models/Message";
import Notification from "../../../../models/Notification";

export async function GET(
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
        { error: "Conversation not found or access denied." },
        { status: 404 }
      );
    }

    // Mark messages addressed to current user as read
    await Message.updateMany(
      { conversationId: id, recipientId: userId, read: false },
      { $set: { read: true } }
    );

    // Remove current user from unreadBy
    await Conversation.updateOne(
      { _id: id },
      { $pull: { unreadBy: userId } }
    );

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .populate("sender", "name username avatar")
      .lean();

    const formatted = messages.map((m: any) => ({
      _id: m._id.toString(),
      senderId: m.senderId,
      recipientId: m.recipientId,
      sender: m.sender
        ? {
            name: (m.sender as any).name || "",
            username: (m.sender as any).username || "",
            avatar: (m.sender as any).avatar || "",
          }
        : undefined,
      text: m.text,
      mediaUrl: m.mediaUrl || "",
      read: m.read,
      createdAt: m.createdAt,
      isOwn: m.senderId === userId,
    }));

    return NextResponse.json({ messages: formatted });
  } catch (err: any) {
    return handleApiError(err, "Failed to load messages.");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();
    const { id } = await params;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied." },
        { status: 404 }
      );
    }

    const recipientId = conversation.participants.find((p) => p !== userId);
    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient not found in this conversation." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { text, mediaUrl } = body;

    const trimmedText = (text || "").trim();
    if (!trimmedText && !mediaUrl) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      sender: user._id,
      recipientId,
      text: trimmedText,
      mediaUrl: mediaUrl || "",
      read: false,
    });

    // Update conversation snippet and unread flag
    const snippet = trimmedText || (mediaUrl ? "[Attached Photo]" : "New message");
    await Conversation.updateOne(
      { _id: id },
      {
        $set: {
          lastMessage: snippet,
          lastMessageAt: new Date(),
          lastMessageSenderId: userId,
        },
        $addToSet: { unreadBy: recipientId },
      }
    );

    // Send a notification to recipient
    await Notification.create({
      recipientId,
      actorId: userId,
      actorName: user.name,
      actorImage: user.avatar,
      type: "message",
      message: `${user.name} sent you a message: "${snippet.slice(0, 50)}"`,
      read: false,
    });

    return NextResponse.json(
      {
        message: {
          _id: message._id.toString(),
          senderId: message.senderId,
          recipientId: message.recipientId,
          sender: {
            name: user.name,
            username: user.username,
            avatar: user.avatar || "",
          },
          text: message.text,
          mediaUrl: message.mediaUrl,
          read: false,
          createdAt: message.createdAt,
          isOwn: true,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return handleApiError(err, "Failed to send message.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser(true);
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (messageId) {
      // Delete a single message (sender can delete their own message)
      const msg = await Message.findOne({
        _id: messageId,
        conversationId: id,
        senderId: userId,
      });

      if (!msg) {
        return NextResponse.json(
          { error: "Message not found or you are not authorized to delete it." },
          { status: 404 }
        );
      }

      await Message.deleteOne({ _id: messageId });

      // Refresh last message in conversation
      const latest = await Message.findOne({ conversationId: id })
        .sort({ createdAt: -1 })
        .lean();

      await Conversation.updateOne(
        { _id: id },
        {
          $set: {
            lastMessage: latest
              ? latest.text || (latest.mediaUrl ? "[Attached Photo]" : "")
              : "",
            lastMessageAt: latest ? latest.createdAt : new Date(),
          },
        }
      );

      return NextResponse.json({
        message: "Message deleted successfully.",
        messageId,
      });
    }

    // Clear all messages in conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    await Message.deleteMany({ conversationId: id });
    await Conversation.updateOne(
      { _id: id },
      { $set: { lastMessage: "", lastMessageSenderId: "" } }
    );

    return NextResponse.json({
      message: "All messages in conversation deleted.",
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to delete message.");
  }
}
