import { Trophy } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { LeaderboardView } from "./LeaderboardView";
import Footer from "../components/Footer";
export const metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500 shadow-lg shadow-purple-200">
            <Trophy className="h-6 w-6 text-white" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#6C1C74] sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            See who is leading and how many votes everyone has.
          </p>
        </div>

        <LeaderboardView />
        
      </main>
      <Footer />
    </div>
  );
}