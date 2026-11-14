"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

export function VotingTicker() {
  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 25s linear infinite;
        }

        .ticker-wrap:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Fixed Scrolling Ticker */}
      <div className="ticker-wrap fixed left-0 right-0 top-0 z-[100] h-9 w-full overflow-hidden bg-[#6C1C74] text-white shadow-md">
        <div className="ticker-track h-full items-center">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex} className="flex shrink-0 items-center">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="mx-6 flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide"
                >
                  🏆 Boys&apos; Voting Has Ended! Congratulations, Winners! 💜
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Spacer to prevent content hiding behind ticker */}
      <div className="h-9" />

      {/* Floating Leaderboard Button */}
      <div className="fixed bottom-5 right-5 z-[100]">
        <Link
          href="/leaderboard"
          className="flex items-center gap-2 rounded-full bg-[#6C1C74] px-5 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#57165E]"
        >
          <Trophy size={18} />
          See Leaderboard
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}