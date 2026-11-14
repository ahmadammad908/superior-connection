"use client";

// Voting khatam ho chuki hai. Yeh export purani files ke imports na tootne ke liye rakha hai.
export const VOTING_END = new Date("2026-11-14T13:00:00.000Z").getTime();

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
  return (
    <div className="px-4 py-3 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6C1C74]">
        Voting Has Ended
      </p>
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        <TimeBox value="00" label="Hours" />
        <span className="mt-3 text-2xl font-bold text-[#6C1C74] sm:mt-4">:</span>
        <TimeBox value="00" label="Mins" />
        <span className="mt-3 text-2xl font-bold text-[#6C1C74] sm:mt-4">:</span>
        <TimeBox value="00" label="Secs" />
      </div>
    </div>
  );
}