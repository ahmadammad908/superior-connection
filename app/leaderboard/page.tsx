import { Trophy, Lock, Sparkles } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
export const metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500">
            <Trophy className="h-6 w-6 text-white" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#6C1C74] sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            See who is leading and how many votes everyone has.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#6C1C74]/10 bg-white p-8 text-center sm:p-12">
          {/* Timer-style animation */}
          <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
            {/* pulsing ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-[#6C1C74]/10" />
            {/* base ring */}
            <span className="absolute inset-0 rounded-full border-4 border-[#6C1C74]/15" />
            {/* spinning progress arc */}
            <span
              className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#6C1C74] border-r-purple-400"
              style={{ animationDuration: "2s" }}
            />
            {/* clock face */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500">
              {/* minute hand */}
              <span
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "6s", animationTimingFunction: "linear" }}
              >
                <span className="absolute left-1/2 top-2 h-8 w-[3px] -translate-x-1/2 rounded-full bg-white" />
              </span>
              {/* second hand */}
              <span
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "1.5s", animationTimingFunction: "linear" }}
              >
                <span className="absolute left-1/2 top-3 h-7 w-[2px] -translate-x-1/2 rounded-full bg-purple-200" />
              </span>
              {/* center dot */}
              <span className="relative h-3 w-3 rounded-full bg-white" />
            </div>
          </div>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#6C1C74]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6C1C74]">
            <Lock className="h-3.5 w-3.5" />
            Voting Closed
          </span>

          <h2 className="text-2xl font-bold text-[#6C1C74] sm:text-3xl">
             Voting Has Ended
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4B5563] sm:text-base">
            Thank you to everyone who voted! Voting for the girls is now closed.
            Stay tuned and wait for the next update and adventure.
          </p>

          {/* Animated waiting dots */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Sparkles className="h-5 w-5 animate-pulse text-[#6C1C74]" />
            <span className="text-sm font-semibold text-[#6C1C74]">
              New update coming soon
            </span>
            <span className="flex items-end gap-1">
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#6C1C74]"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#6C1C74]"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#6C1C74]"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}