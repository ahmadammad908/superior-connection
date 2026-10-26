import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "../../../lib/db";
import { getPairCounts } from "../../../lib/pairVotes";
import { VotingPair } from "../../../models/VotingPair";
import { Vote } from "../../../models/Vote";
import "../../../models/Student";
import { auth } from "@clerk/nextjs/server";

// Kuch pairs lo aur wo pehli chuno jiske dono students maujood hon
async function findPair(excludeIds: string[]) {
  const filter: any = { active: true };
  if (excludeIds.length > 0) filter._id = { $nin: excludeIds };

  const candidates: any[] = await VotingPair.find(filter)
    .sort({ createdAt: 1 })
    .limit(10)
    .populate("leftId")
    .populate("rightId")
    .lean();

  return candidates.find((p) => p.leftId && p.rightId) ?? null;
}

export async function GET(req: NextRequest) {
  try {
    await connection();
    await connectDB();
    const { userId } = await auth();

    // ?skip=id1,id2 -> user ne jo pairs skip ki hain
    const skipIds = (req.nextUrl.searchParams.get("skip") || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => isValidObjectId(s))
      .slice(0, 100);

    let votedPairIds: string[] = [];
    let votedCount = 0;

    if (userId) {
      votedPairIds = (await Vote.find({ voterId: userId }).distinct("pairId")).map(
        (id: any) => String(id)
      );
      votedCount = votedPairIds.length;
    }

    let pair = await findPair([...votedPairIds, ...skipIds]);
    let recycled = false;

    // Skip ki hui pairs ke ilawa kuch nahi bacha -> dobara shuru se dikhao
    if (!pair && skipIds.length > 0) {
      pair = await findPair(votedPairIds);
      recycled = !!pair;
    }

    if (!pair) return NextResponse.json({ pair: null, userId, votedCount });

    const counts = await getPairCounts(
      String(pair._id),
      String(pair.leftId._id),
      String(pair.rightId._id)
    );

    return NextResponse.json({
      pair: {
        _id: String(pair._id),
        leftId: pair.leftId,
        rightId: pair.rightId,
        counts,
      },
      userId,
      votedCount,
      recycled,
    });
  } catch (e) {
    console.error("GET /api/pairs/next error:", e);
    return NextResponse.json({ pair: null }, { status: 500 });
  }
}