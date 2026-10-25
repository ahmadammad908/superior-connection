import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "../../../lib/db";
import { getPairCounts } from "../../../lib/pairVotes";
import { VotingPair } from "../../../models/VotingPair";
import { Vote } from "../../../models/Vote";
import "../../../models/Student";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connection();
    await connectDB();
    const { userId } = await auth();

    const filter: any = { active: true };
    let votedCount = 0;

    if (userId) {
      const votedPairIds = await Vote.find({ voterId: userId }).distinct("pairId");
      votedCount = votedPairIds.length;
      if (votedPairIds.length > 0) {
        filter._id = { $nin: votedPairIds };
      }
    }

    const pair: any = await VotingPair.findOne(filter)
      .sort({ createdAt: 1 })
      .populate("leftId")
      .populate("rightId")
      .lean();

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
    });
  } catch (e) {
    console.error("GET /api/pairs/next error:", e);
    return NextResponse.json({ pair: null }, { status: 500 });
  }
}