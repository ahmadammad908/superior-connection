import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";
import { VotingPair } from "../../../../models/VotingPair";
import { Vote } from "../../../../models/Vote";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const body = await req.json();

    if (body.reset) {
      await Vote.deleteMany({ pairId: id });
      return NextResponse.json({ ok: true });
    }

    if (typeof body.active === "boolean") {
      const updated = await VotingPair.findByIdAndUpdate(
        id,
        { active: body.active },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json({ error: "Pair not found" }, { status: 404 });
      }
      return NextResponse.json({ pair: updated });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("PATCH pair error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();

    const deleted = await VotingPair.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }

    await Vote.deleteMany({ pairId: id });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("DELETE pair error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}