import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { requireUser, handleApiError } from "../../lib/auth";
import Conversation from "../../models/Conversation";
import User from "../../models/User";

export async function GET() {
  try {
    const { userId } = await requireUser(true);
    await connectDB();

    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participantUsers", "clerkId name username avatar department role isBanned")
      .lean();

    const formatted = await Promise.all(
      conversations.map(async (c: any) => {
        let otherUser =
          (c.participantUsers || []).find((u: any) => u && u.clerkId !== userId) || null;

        if (!otherUser) {
          const otherClerkId = (c.participants || []).find((p: string) => p !== userId);
          if (otherClerkId) {
            otherUser = await User.findOne({ clerkId: otherClerkId }).lean();
          }
        }

        return {
          _id: c._id.toString(),
          otherUser: {
            clerkId: otherUser?.clerkId || "",
            name: otherUser?.name || "Student",
            username: otherUser?.username || "student",
            avatar: otherUser?.avatar || "",
            department: otherUser?.department || "",
            role: otherUser?.role || "student",
            isBanned: otherUser?.isBanned || false,
          },
          lastMessage: c.lastMessage || "",
          lastMessageAt: c.lastMessageAt,
          lastMessageSenderId: c.lastMessageSenderId,
          isUnread: (c.unreadBy || []).includes(userId),
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (err: any) {
    return handleApiError(err, "Failed to load conversations.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, user } = await requireUser(true);
    await connectDB();

    const body = await req.json();
    const { targetUserId, targetUsername } = body;

    let target = null;
    if (targetUserId) {
      target = await User.findOne({ clerkId: targetUserId });
    } else if (targetUsername) {
      target = await User.findOne({ username: targetUsername.toLowerCase().trim() });
    }

    if (!target) {
      return NextResponse.json(
        { error: "Student not found." },
        { status: 404 }
      );
    }

    if (target.clerkId === userId) {
      return NextResponse.json(
        { error: "You cannot message yourself." },
        { status: 400 }
      );
    }

    // Check if conversation already exists between both participants
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, target.clerkId], $size: 2 },
    }).populate("participantUsers", "clerkId name username avatar department role");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, target.clerkId],
        participantUsers: [user._id, target._id],
        lastMessage: "",
        lastMessageAt: new Date(),
        unreadBy: [],
      });
      // Populate
      conversation = await Conversation.findById(conversation._id).populate(
        "participantUsers",
        "clerkId name username avatar department role"
      );
    } else if (!conversation.participantUsers || conversation.participantUsers.length < 2) {
      conversation.participantUsers = [user._id, target._id];
      await conversation.save();
    }

    const otherUser =
      ((conversation as any).participantUsers || []).find(
        (u: any) => u.clerkId !== userId
      ) || target;

    return NextResponse.json({
      conversation: {
        _id: conversation!._id.toString(),
        otherUser: {
          clerkId: otherUser.clerkId || target.clerkId,
          name: otherUser.name || target.name,
          username: otherUser.username || target.username,
          avatar: otherUser.avatar || target.avatar || "",
          department: otherUser.department || target.department || "",
          role: otherUser.role || target.role || "student",
        },
        lastMessage: conversation!.lastMessage || "",
        lastMessageAt: conversation!.lastMessageAt,
        isUnread: false,
      },
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to create or open conversation.");
  }
}
