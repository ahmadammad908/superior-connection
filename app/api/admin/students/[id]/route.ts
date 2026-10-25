import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";
import { Student } from "../../../../models/Student";
import { VotingPair } from "../../../../models/VotingPair";
import { Vote } from "../../../../models/Vote";
import { cloudinary } from "../../../../lib/cloudinary";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const updated = await Student.findByIdAndUpdate(id, body, {
      new: true,
    }).lean();
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ student: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("PATCH student error:", e);
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

    const student: any = await Student.findById(id).lean();
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // find every pair this student is part of
    const pairs = await VotingPair.find({
      $or: [{ leftId: id }, { rightId: id }],
    })
      .select("_id")
      .lean();
    const pairIds = pairs.map((p: any) => p._id);

    // remove votes for those pairs, then the pairs, then any votes for the student
    if (pairIds.length > 0) {
      await Vote.deleteMany({ pairId: { $in: pairIds } });
      await VotingPair.deleteMany({ _id: { $in: pairIds } });
    }
    await Vote.deleteMany({ selectedStudentId: id });

    await Student.findByIdAndDelete(id);

    // delete the image last, so a Cloudinary failure never blocks the delete
    if (student.imagePublicId) {
      await cloudinary.uploader.destroy(student.imagePublicId).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("DELETE student error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}