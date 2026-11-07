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
     
      <WebsiteComments />
    </>
  );
}