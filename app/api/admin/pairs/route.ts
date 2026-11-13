import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAdmin } from "../../../lib/auth";
import { VotingPair } from "../../../models/VotingPair";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const pairs = await VotingPair.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ pairs });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("GET /api/admin/pairs error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { leftId, rightId } = await req.json();
    if (!leftId || !rightId || leftId === rightId)
      return NextResponse.json(
        { error: "Pick two distinct students" },
        { status: 400 }
      );
    await connectDB();
    const pair = await VotingPair.create({ leftId, rightId, active: false });
    return NextResponse.json({ pair });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("POST /api/admin/pairs error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}