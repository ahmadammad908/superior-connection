import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../app/./lib/db";
import { getPairCounts } from "../app/./lib/pairVotes";
import { VotingPair } from "../app/./models/VotingPair";
import { Vote } from "../app/./models/Vote";
import "../app/./models/Student";
import { VotingCards } from "../app/./components/VotingCards";

export async function ActivePairSection() {
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

  let initialPair = null;
  if (pair) {
    const counts = await getPairCounts(
      String(pair._id),
      String(pair.leftId._id),
      String(pair.rightId._id)
    );
    initialPair = { ...JSON.parse(JSON.stringify(pair)), counts };
  }

  return <VotingCards initialPair={initialPair} initialVotedCount={votedCount} />;
}