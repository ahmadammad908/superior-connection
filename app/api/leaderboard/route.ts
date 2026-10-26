import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { Vote } from "../../models/Vote";
import { VotingPair } from "../../models/VotingPair";

export async function GET() {
  try {
    await connectDB();

    const [grouped, pairDocs] = await Promise.all([
      Vote.aggregate([
        {
          $group: {
            _id: { pairId: "$pairId", studentId: "$selectedStudentId" },
            votes: { $sum: 1 },
          },
        },
      ]),
      VotingPair.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("leftId rightId", "name department imageUrl")
        .lean(),
    ]);

    // votes per (pair, student)
    const perPair = new Map<string, number>();
    let totalVotes = 0;
    for (const g of grouped as any[]) {
      perPair.set(`${String(g._id.pairId)}:${String(g._id.studentId)}`, g.votes);
      totalVotes += g.votes;
    }

    const pick = (s: any, votes: number) => ({
      _id: String(s._id),
      name: s.name as string,
      department: (s.department as string) ?? null,
      imageUrl: (s.imageUrl as string) ?? null,
      votes,
    });

    const pairs = (pairDocs as any[])
      .filter((p) => p.leftId && p.rightId)
      .map((p) => {
        const l = perPair.get(`${p._id}:${p.leftId._id}`) ?? 0;
        const r = perPair.get(`${p._id}:${p.rightId._id}`) ?? 0;
        return {
          _id: String(p._id),
          active: Boolean(p.isActive),
          left: pick(p.leftId, l),
          right: pick(p.rightId, r),
          total: l + r,
          winner: l === r ? "tie" : l > r ? "left" : "right",
        };
      })
      // Live pairs sab se upar (baaki order newest-first rehta hai)
      .sort((a, b) => Number(b.active) - Number(a.active));

    return NextResponse.json({
      totals: {
        votes: totalVotes,
        pairs: pairs.length,
        live: pairs.filter((p) => p.active).length,
      },
      pairs,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json(
      { error: "Could not load leaderboard." },
      { status: 500 }
    );
  }
}