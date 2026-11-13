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



























// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "../../../../lib/db";
// import { requireAdmin } from "../../../../lib/auth";
// import { Student } from "../../../../models/Student";
// import { VotingPair } from "../../../../models/VotingPair";
// import { Vote } from "../../../../models/Vote";
// import { cloudinary } from "../../../../lib/cloudinary";

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     await requireAdmin();
//     const { id } = await params;
//     await connectDB();
//     const body = await req.json();

//     // sirf allowed fields update hongi
//     const update: Record<string, string> = {};
//     if (typeof body.name === "string" && body.name.trim())
//       update.name = body.name.trim();
//     if (typeof body.department === "string")
//       update.department = body.department;
//     if (typeof body.imageUrl === "string" && body.imageUrl) {
//       if (!/^https:\/\/res\.cloudinary\.com\//.test(body.imageUrl))
//         return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
//       update.imageUrl = body.imageUrl;
//     }
//     if (typeof body.imagePublicId === "string" && body.imagePublicId)
//       update.imagePublicId = body.imagePublicId;

//     if (Object.keys(update).length === 0)
//       return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

//     const old: any = await Student.findById(id).lean();
//     if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const updated = await Student.findByIdAndUpdate(id, update, {
//       new: true,
//     }).lean();

//     // image badli hai to purani image Cloudinary se delete (fail ho to koi masla nahi)
//     if (
//       update.imagePublicId &&
//       old.imagePublicId &&
//       old.imagePublicId !== update.imagePublicId
//     ) {
//       await cloudinary.uploader.destroy(old.imagePublicId).catch(() => {});
//     }

//     return NextResponse.json({ student: updated });
//   } catch (e) {
//     if (e instanceof Response) return e;
//     console.error("PATCH student error:", e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function DELETE(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     await requireAdmin();
//     const { id } = await params;
//     await connectDB();

//     const student: any = await Student.findById(id).lean();
//     if (!student)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     // find every pair this student is part of
//     const pairs = await VotingPair.find({
//       $or: [{ leftId: id }, { rightId: id }],
//     })
//       .select("_id")
//       .lean();
//     const pairIds = pairs.map((p: any) => p._id);

//     // remove votes for those pairs, then the pairs, then any votes for the student
//     if (pairIds.length > 0) {
//       await Vote.deleteMany({ pairId: { $in: pairIds } });
//       await VotingPair.deleteMany({ _id: { $in: pairIds } });
//     }
//     await Vote.deleteMany({ selectedStudentId: id });

//     await Student.findByIdAndDelete(id);

//     // delete the image last, so a Cloudinary failure never blocks the delete
//     if (student.imagePublicId) {
//       await cloudinary.uploader.destroy(student.imagePublicId).catch(() => {});
//     }

//     return NextResponse.json({ ok: true });
//   } catch (e) {
//     if (e instanceof Response) return e;
//     console.error("DELETE student error:", e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }