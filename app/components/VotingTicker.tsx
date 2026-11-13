"use client";

import { useEffect, useState } from "react";
import { VOTING_END } from "./Countdown"; // apna sahi path likhein

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
      ? "--h --m --s"
      : `${pad(Math.floor(diff / 3_600_000))}h ${pad(
          Math.floor((diff % 3_600_000) / 60_000)
        )}m ${pad(Math.floor((diff % 60_000) / 1000))}s`;

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
                  className="mx-6 flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide"
                >
                  {ended ? (
                    <>💜 Boys&apos; Voting has ended. Thank you for the love!</>
                  ) : (
                    <>
                      <span>🔥 Boys&apos; Voting is Live! Time Left:</span>
                      <span className="rounded-full bg-white/20 px-3 py-0.5 font-bold tabular-nums">
                        ⏳ {time}
                      </span>
                    </>
                  )}
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