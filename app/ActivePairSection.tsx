// import { connection } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { connectDB } from "../app/./lib/db";
// import { getPairCounts } from "../app/./lib/pairVotes";
// import { VotingPair } from "../app/./models/VotingPair";
// import { Vote } from "../app/./models/Vote";
// import "../app/./models/Student";
// import { VotingCards } from "../app/./components/VotingCards";
// import { WebsiteComments } from "./components/CommentSection"; // apne folder ke mutabiq path

// export async function ActivePairSection() {
//   await connection();
//   await connectDB();
//   const { userId } = await auth();

//   const filter: any = { active: true };
//   let votedCount = 0;

//   if (userId) {
//     const votedPairIds = await Vote.find({ voterId: userId }).distinct("pairId");
//     votedCount = votedPairIds.length;
//     if (votedPairIds.length > 0) {
//       filter._id = { $nin: votedPairIds };
//     }
//   }

//   // Kuch pairs lo aur wo pehli chuno jiske dono students maujood hon
//   const candidates: any[] = await VotingPair.find(filter)
//     .sort({ createdAt: 1 })
//     .limit(10)
//     .populate("leftId")
//     .populate("rightId")
//     .lean();

//   const pair = candidates.find((p) => p.leftId && p.rightId);

//   let initialPair = null;
//   if (pair) {
//     const counts = await getPairCounts(
//       String(pair._id),
//       String(pair.leftId._id),
//       String(pair.rightId._id)
//     );
//     initialPair = { ...JSON.parse(JSON.stringify(pair)), counts };
//   }

//   return (
//     <>
//       <VotingCards initialPair={initialPair} initialVotedCount={votedCount} />
//        <section id="comments" className="scroll-mt-24">
//         <WebsiteComments />
//       </section>
//     </>
//   );
// }

import { connection } from "next/server";
import { connectDB } from "../app/./lib/db";
import { getPairCounts } from "../app/./lib/pairVotes";
import { VotingPair } from "../app/./models/VotingPair";
import "../app/./models/Student";
import { WinnersPage } from "../app/./components/WinnersPage"; // winners-page.tsx yahan rakhein
import { WebsiteComments } from "./components/CommentSection"; // apne folder ke mutabiq path

// getPairCounts ka shape mujhe nahi pata, is liye kuch common shapes handle kiye hain
function votesFor(counts: any, side: "left" | "right", studentId: string) {
  return Number(
    counts?.[side] ?? counts?.[`${side}Count`] ?? counts?.[studentId] ?? 0
  );
}

const toStudent = (s: any, votes: number) => ({
  _id: String(s._id),
  name: s.name,
  department: s.department,
  imageUrl: s.imageUrl,
  votes,
});

// Naam wahi rakha hai taake baqi pages mein import na badalna paray
export async function ActivePairSection() {
  await connection();
  await connectDB();

  // Voting khatam: active filter nahi, saari pairs (sirf wo jinke dono students maujood hon)
  const rows: any[] = await VotingPair.find({})
    .sort({ createdAt: 1 })
    .populate("leftId")
    .populate("rightId")
    .lean();

  const pairs = await Promise.all(
    rows
      .filter((p) => p.leftId && p.rightId)
      .map(async (p) => {
        const leftId = String(p.leftId._id);
        const rightId = String(p.rightId._id);
        const counts = await getPairCounts(String(p._id), leftId, rightId);
        return {
          _id: String(p._id),
          left: toStudent(p.leftId, votesFor(counts, "left", leftId)),
          right: toStudent(p.rightId, votesFor(counts, "right", rightId)),
        };
      })
  );

  return (
    <>
      {pairs.length > 0 ? (
        <WinnersPage pairs={pairs} embedded />
      ) : (
        <p className="py-16 text-center text-sm font-medium text-[#6C1C74]">
          Voting is now closed. Results will be shared soon.
        </p>
      )}
      <WebsiteComments />
    </>
  );
}