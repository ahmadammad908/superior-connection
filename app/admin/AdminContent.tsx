import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../lib/db";
import { Student } from "../models/Student";
import { VotingPair } from "../models/VotingPair";
import { Vote } from "../models/Vote";
import { AdminDashboard } from "../components/AdminDashboard";

export default async function AdminContent() {
  await connection();

  const { userId } = await auth();
  if (userId !== process.env.ADMIN_CLERK_USER_ID) redirect("/");

  await connectDB();
  const students = (await Student.find().sort({ createdAt: -1 }).lean()).map(
    (s: any) => ({ ...s, _id: String(s._id) })
  );
  const pairs = (await VotingPair.find().sort({ createdAt: -1 }).lean()).map(
    (p: any) => ({
      _id: String(p._id),
      leftId: String(p.leftId),
      rightId: String(p.rightId),
      active: p.active,
      round: p.round,
    })
  );

  const voteCounts = await Vote.aggregate([
    { $group: { _id: "$selectedStudentId", count: { $sum: 1 } } },
  ]);
  const countsMap: Record<string, number> = {};
  voteCounts.forEach((v: any) => (countsMap[String(v._id)] = v.count));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            View public site →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <AdminDashboard
          initialStudents={JSON.parse(JSON.stringify(students))}
          initialPairs={JSON.parse(JSON.stringify(pairs))}
          voteCounts={countsMap}
        />
      </main>
    </div>
  );
}