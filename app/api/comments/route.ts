import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectDB } from "../../lib/db";
import Comment from "../../models/Comment";

const FIELDS = "body authorName authorImage createdAt parentId replyToName";

// GET /api/comments?before=ISO_DATE&limit=20  (public, sab dekh sakte hain)
// Sirf top-level comments paginate hote hain, har comment ke saath uski replies aati hain.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  await connectDB();

  // `parentId: null` purane comments ko bhi match karta hai jin mein yeh field nahi hai
  const filter: Record<string, unknown> = { parentId: null };
  if (before) {
    const d = new Date(before);
    if (!isNaN(d.getTime())) filter.createdAt = { $lt: d };
  }

  const docs = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(FIELDS)
    .lean();

  // In comments ki saari replies (purani pehle)
  const replyDocs = docs.length
    ? await Comment.find({ parentId: { $in: docs.map((d: any) => d._id) } })
        .sort({ createdAt: 1 })
        .select(FIELDS)
        .lean()
    : [];

  const byParent = new Map<string, any[]>();
  for (const r of replyDocs as any[]) {
    const key = String(r.parentId);
    const list = byParent.get(key) ?? [];
    list.push(r);
    byParent.set(key, list);
  }

  const comments = docs.map((d: any) => ({
    ...d,
    replies: byParent.get(String(d._id)) ?? [],
  }));

  return NextResponse.json({
    comments,
    nextBefore:
      docs.length === limit ? (docs[docs.length - 1] as any).createdAt : null,
  });
}

// POST /api/comments  { body, parentId? }  (login required)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to comment.", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const data = await req.json().catch(() => ({}));
  const body = typeof data.body === "string" ? data.body.trim() : "";

  if (!body || body.length > 300) {
    return NextResponse.json(
      { error: "Comment must be 1–300 characters." },
      { status: 400 }
    );
  }

  await connectDB();

  // Spam rokne ke liye: 10 second mein ek hi comment (reply par bhi lagta hai)
  const recent = await Comment.findOne({
    userId,
    createdAt: { $gt: new Date(Date.now() - 10_000) },
  }).lean();
  if (recent) {
    return NextResponse.json(
      { error: "Please wait a few seconds before commenting again." },
      { status: 429 }
    );
  }

  // ---- Reply handling ----
  // parentId hamesha top-level comment ki taraf jata hai (sirf aik level nesting).
  // Agar kisi reply ka reply ho, to replyToName mein us bande ka naam save hota hai.
  let rootId: mongoose.Types.ObjectId | null = null;
  let replyToName: string | undefined;

  if (data.parentId) {
    if (!mongoose.isValidObjectId(data.parentId)) {
      return NextResponse.json(
        { error: "Invalid comment to reply to." },
        { status: 400 }
      );
    }

    const parent = (await Comment.findById(data.parentId).lean()) as any;
    if (!parent) {
      return NextResponse.json(
        { error: "The comment you are replying to no longer exists." },
        { status: 404 }
      );
    }

    if (parent.parentId) {
      rootId = parent.parentId;
      replyToName = parent.authorName || "Student";
    } else {
      rootId = parent._id;
    }
  }

  const user = await currentUser();
  const authorName = user?.username || user?.firstName || "Student";

  const created = await Comment.create({
    userId,
    authorName,
    authorImage: user?.imageUrl,
    body,
    parentId: rootId,
    replyToName,
  });

  return NextResponse.json(
    {
      comment: {
        _id: created._id,
        body: created.body,
        authorName: created.authorName,
        authorImage: created.authorImage,
        createdAt: created.createdAt,
        parentId: created.parentId ?? null,
        replyToName: created.replyToName,
        replies: [],
      },
    },
    { status: 201 }
  );
}