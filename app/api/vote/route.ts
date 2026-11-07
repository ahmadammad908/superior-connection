import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../lib/db";
import { getPairCounts } from "../../lib/pairVotes";
import { Vote } from "../../models/Vote";
import { VotingPair } from "../../models/VotingPair";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "Please sign up or sign in first to vote.",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const { pairId, selectedStudentId } = body || {};
    if (!pairId || !selectedStudentId) {
      return NextResponse.json(
        { error: "Missing vote details.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    await connectDB();

    const pair: any = await VotingPair.findById(pairId).lean();
    if (!pair) {
      return NextResponse.json(
        { error: "This pair no longer exists.", code: "PAIR_NOT_FOUND" },
        { status: 404 }
      );
    }
    if (!pair.active) {
      return NextResponse.json(
        { error: "Voting on this pair has been closed.", code: "PAIR_INACTIVE" },
        { status: 400 }
      );
    }

    const validIds = [String(pair.leftId), String(pair.rightId)];
    if (!validIds.includes(String(selectedStudentId))) {
      return NextResponse.json(
        { error: "That student is not in this pair.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const counts = () =>
      getPairCounts(String(pair._id), String(pair.leftId), String(pair.rightId));

    const existing = await Vote.findOne({ pairId, voterId: userId }).lean();
    if (existing) {
      return NextResponse.json(
        {
          error: "You have already voted on this pair.",
          code: "ALREADY_VOTED",
          counts: await counts(),
        },
        { status: 409 }
      );
    }

    try {
      await Vote.create({ pairId, voterId: userId, selectedStudentId });
    } catch (e: any) {
      if (e?.code === 11000) {
        return NextResponse.json(
          {
            error: "You have already voted on this pair.",
            code: "ALREADY_VOTED",
            counts: await counts(),
          },
          { status: 409 }
        );
      }
      throw e;
    }

    return NextResponse.json({ ok: true, counts: await counts() });
  } catch (e: any) {
    console.error("POST /api/vote error:", e);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}