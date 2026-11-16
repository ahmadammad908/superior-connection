import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/auth";
import User from "../../../../../models/User";
import Notification from "../../../../../models/Notification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminUserId } = await requireAdmin();
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.clerkId === adminUserId) {
      return NextResponse.json(
        { error: "Cannot ban the admin account." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, reason, durationDays, bannedUntil } = body;

    if (action === "unban") {
      user.isBanned = false;
      user.banReason = "";
      user.bannedUntil = null;
      await user.save();

      await Notification.create({
        recipientId: user.clerkId,
        actorId: adminUserId,
        actorName: "Superior Administration",
        type: "announcement",
        message: "Your account ban/suspension has been lifted. Welcome back!",
        read: false,
      });

      return NextResponse.json({
        message: "User unbanned successfully.",
        user: {
          _id: user._id.toString(),
          isBanned: false,
          banReason: "",
          bannedUntil: null,
        },
      });
    }

    // Ban or Suspend
    user.isBanned = true;
    user.banReason = (reason || "Violation of campus rules").trim();

    if (durationDays && Number(durationDays) > 0) {
      const until = new Date();
      until.setDate(until.getDate() + Number(durationDays));
      user.bannedUntil = until;
    } else if (bannedUntil) {
      user.bannedUntil = new Date(bannedUntil);
    } else {
      user.bannedUntil = null; // Permanent ban
    }

    await user.save();

    const suspendText = user.bannedUntil
      ? `suspended until ${new Date(user.bannedUntil).toLocaleDateString()}`
      : "banned";

    await Notification.create({
      recipientId: user.clerkId,
      actorId: adminUserId,
      actorName: "Superior Administration",
      type: "warning",
      message: `Your account has been ${suspendText}. Reason: ${user.banReason}`,
      read: false,
    });

    return NextResponse.json({
      message: `User has been ${suspendText}.`,
      user: {
        _id: user._id.toString(),
        isBanned: true,
        banReason: user.banReason,
        bannedUntil: user.bannedUntil,
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/admin/users/[id]/ban error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update ban status." },
      { status: 500 }
    );
  }
}
