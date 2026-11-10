"use client";

import { useEffect, useState } from "react";
import { Hourglass, Sparkles } from "lucide-react";

// Boys' voting start date (one week from now). Pakistan time (+05:00).
// Change this to move the countdown, or set to null to hide it.
const LAUNCH_DATE: string | null = "2026-11-17T00:00:00+05:00";

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C1C74] to-purple-500 text-2xl font-bold text-white shadow-lg shadow-purple-200 sm:h-20 sm:w-20 sm:text-3xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-[#6C1C74]/70 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function BoysVotingSoon() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    if (!LAUNCH_DATE) return;
    const target = new Date(LAUNCH_DATE).getTime();
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#6C1C74]/15 bg-white p-6 text-center shadow-xl shadow-purple-100 sm:p-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 animate-pulse rounded-full bg-[#6C1C74]/10 blur-3xl" />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 animate-pulse rounded-full bg-purple-400/20 blur-3xl"
        style={{ animationDelay: "1s" }}
      />

      {/* Animated timer icon */}
      <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#6C1C74]/15" />
        <span
          className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-[#6C1C74]/30"
          style={{ animationDuration: "12s" }}
        />
        <span
          className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-[#6C1C74] border-r-purple-400"
          style={{ animationDuration: "2.5s" }}
        />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500 shadow-lg shadow-purple-300">
          <Hourglass
            className="h-8 w-8 animate-bounce text-white"
            style={{ animationDuration: "2s" }}
          />
        </span>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#6C1C74]">
        <Sparkles className="h-3.5 w-3.5" />
        Teachers Voting Ended
      </span>

      <h2 className="mt-4 text-2xl font-bold text-[#6C1C74] sm:text-3xl">
        Boys&apos; Voting Is Coming Soon
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4B5563]">
        Voting for the teachers has now ended. Voting for the boys will begin
        in one week, so please wait a little longer. Thank you so much for
        staying with us! 💜
      </p>

      {/* Countdown (only shown when LAUNCH_DATE is set) */}
      {LAUNCH_DATE && (
        <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
          <TimeBox value={time?.days ?? 0} label="Days" />
          <TimeBox value={time?.hours ?? 0} label="Hours" />
          <TimeBox value={time?.minutes ?? 0} label="Mins" />
          <TimeBox value={time?.seconds ?? 0} label="Secs" />
        </div>
      )}

      {/* Animated dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#6C1C74]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-[#6C1C74]/70">
        Stay tuned
      </p>
    </div>
  );
}