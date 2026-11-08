"use client";

import { useEffect, useState } from "react";
import { VOTING_END } from "../lib/votingConfig";

const pad = (n: number) => String(n).padStart(2, "0");

export function VotingTicker() {
  // null rakha hai taake hydration mismatch na aaye
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : Math.max(0, VOTING_END - now);
  const ended = diff === 0;

  const time =
    diff === null
      ? "--:--:--"
      : `${pad(Math.floor(diff / 3_600_000))}:${pad(
          Math.floor((diff % 3_600_000) / 60_000)
        )}:${pad(Math.floor((diff % 60_000) / 1000))}`;

  const text = ended
    ? "🏁 Voting has ended. Thank you for showing love to our teachers! 💜"
    : `💜 Teacher appreciation voting is live! Voting closes in ${time}. Cast your vote now ⏳`;

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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

      {/* Fixed scrolling tape (har page par sabse upar) */}
      <div className="ticker-wrap fixed left-0 right-0 top-0 z-[100] h-9 w-full overflow-hidden bg-[#6C1C74] text-white shadow-md">
        <div className="ticker-track h-full items-center">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex} className="flex shrink-0 items-center">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="mx-8 whitespace-nowrap text-sm font-semibold tabular-nums tracking-wide"
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Spacer taake content tape ke peeche na chhupe */}
      <div className="h-9" />
    </>
  );
}