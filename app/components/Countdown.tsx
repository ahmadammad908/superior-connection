"use client";

import { useEffect, useState } from "react";

// 👇 Sirf yahan change karein: voting ka END time
// Abhi se 24 ghante baad ka time nikalne ke liye browser console mein ye chalayein:
//   new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
// Jo value aaye (maslan "2026-11-14T13:00:00.000Z") wo neeche paste karein.
export const VOTING_END = new Date("2026-11-14T13:00:00.000Z").getTime();

const pad = (n: number) => String(n).padStart(2, "0");

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C1C74] to-[#A23BAD] text-2xl font-extrabold tabular-nums text-white shadow-md shadow-purple-300 sm:h-16 sm:w-16 sm:text-3xl">
        {value}
      </div>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#6C1C74]">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  // null rakha hai taake server aur browser ka time match na karne par hydration error na aaye
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : Math.max(0, VOTING_END - now);

  if (diff === 0) {
    return (
      <div className="rounded-2xl bg-[#6C1C74]/10 px-4 py-3 text-center text-sm font-semibold text-[#6C1C74]">
        Voting has ended. Thank you for the love! 💜
      </div>
    );
  }

  const hours = diff === null ? "--" : pad(Math.floor(diff / 3_600_000));
  const minutes = diff === null ? "--" : pad(Math.floor((diff % 3_600_000) / 60_000));
  const seconds = diff === null ? "--" : pad(Math.floor((diff % 60_000) / 1000));

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#6C1C74]/10 to-transparent px-4 py-3 text-center">
      <p className="mb-2 text-xs font-semibold text-[#6C1C74]">
        <span className="inline-block animate-pulse">⏳</span> Voting closes in
      </p>
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        <TimeBox value={hours} label="Hours" />
        <span className="mt-3 text-2xl font-bold text-[#6C1C74] sm:mt-4">:</span>
        <TimeBox value={minutes} label="Mins" />
        <span className="mt-3 text-2xl font-bold text-[#6C1C74] sm:mt-4">:</span>
        <TimeBox value={seconds} label="Secs" />
      </div>
    </div>
  );
}