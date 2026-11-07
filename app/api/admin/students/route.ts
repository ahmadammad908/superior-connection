import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAdmin } from "../../../lib/auth";
import { Student } from "../../../models/Student";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ students });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, department, imageUrl, imagePublicId } = body;
    if (!name || !imageUrl || !imagePublicId)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    await connectDB();
    const student = await Student.create({
      name,
      department,
      imageUrl,
      imagePublicId,
    });
    return NextResponse.json({ student });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}