"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Crown, X } from "lucide-react";

// "See more results" button is page par le jayega (apne route ke mutabiq badal lein)
const LEADERBOARD_PATH = "/leaderboard";

// Popup band karne ke kitni der baad dobara aaye (milliseconds). 30000 = 30 second
const REOPEN_AFTER_MS = 30000;

type Student = {
  _id: string;
  name: string;
  department?: string;
  imageUrl: string;
  votes: number;
};

type Pair = {
  _id: string;
  left: Student;
  right: Student;
};

type Ranked = { student: Student; tie: boolean; rank: number };

// Jo zyada votes le, wohi winner. Barabar hon to dono co-winner.
function getWinners(pair: Pair): { students: Student[]; tie: boolean } {
  if (pair.left.votes > pair.right.votes) return { students: [pair.left], tie: false };
  if (pair.right.votes > pair.left.votes) return { students: [pair.right], tie: false };
  return { students: [pair.left, pair.right], tie: true };
}

// Winners ko votes ke hisab se (zyada se kam) order karo aur rank do
function rankWinners(pairs: Pair[]): Ranked[] {
  const list = pairs
    .flatMap((pair) => {
      const { students, tie } = getWinners(pair);
      return students.map((student) => ({ student, tie }));
    })
    .sort((a, b) => b.student.votes - a.student.votes);

  // Barabar votes wale ko same rank milti hai
  return list.map((w) => ({
    ...w,
    rank: list.findIndex((x) => x.student.votes === w.student.votes) + 1,
  }));
}

const css = (v: Record<string, string | number>) => v as unknown as CSSProperties;

/* Podium ke rang aur size (rank ke hisab se) */
const MEDAL: Record<number, { ring: string; block: string; text: string }> = {
  1: {
    ring: "ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,.35)]",
    block: "from-amber-200 via-amber-400 to-yellow-600",
    text: "text-amber-950",
  },
  2: {
    ring: "ring-slate-200",
    block: "from-slate-100 via-slate-300 to-slate-500",
    text: "text-slate-800",
  },
  3: {
    ring: "ring-orange-300",
    block: "from-orange-200 via-orange-400 to-amber-700",
    text: "text-orange-950",
  },
};
const MEDAL_DEFAULT = {
  ring: "ring-purple-300",
  block: "from-purple-300 via-purple-500 to-purple-800",
  text: "text-white",
};
const BLOCK_H: Record<number, string> = {
  1: "h-20 sm:h-24",
  2: "h-16 sm:h-20",
  3: "h-12 sm:h-16",
};
const AVATAR: Record<number, string> = {
  1: "h-20 w-20 sm:h-24 sm:w-24",
};

const CONFETTI = ["#fcd34d", "#ffffff", "#d946ef", "#a78bfa", "#fbbf24", "#f9a8d4"];

/* Jeet ke lamhe par ek dafa halka confetti (poori screen par) */
function Confetti({ delay }: { delay: number }) {
  return (
    <div
      aria-hidden
      className="wp-fx pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="wp-confetti"
          style={css({
            left: `${(i * 29) % 100}%`,
            width: 6 + (i % 3) * 2,
            height: 10 + (i % 4) * 3,
            "--c": CONFETTI[i % CONFETTI.length],
            "--sx": `${((i * 37) % 120) - 60}px`,
            "--r": `${(i * 83) % 720}deg`,
            animationDelay: `${delay + (i % 9) * 0.12}s`,
            animationDuration: `${3.2 + (i % 5) * 0.5}s`,
          })}
        />
      ))}
    </div>
  );
}

function CongratsPopup({
  winners,
  onClose,
}: {
  winners: Ranked[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const n = winners.length;

  // Podium order: 1st beech mein, 2nd left, 3rd right, phir isi tarah
  const display: { w: Ranked; i: number }[] = [];
  winners.forEach((w, i) => {
    const item = { w, i };
    if (i % 2 === 1) display.unshift(item);
    else display.push(item);
  });

  // Reveal: sab se akhri rank pehle, 1st sab se akhir mein (thora suspense ke saath)
  const delayOf = (i: number) => 1.0 + (n - 1 - i) * 1.2 + (i === 0 && n > 1 ? 0.6 : 0);
  const tFirst = delayOf(0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0210]/80 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes wp-dialog-in { from { opacity: 0; transform: scale(.96) translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes wp-fade-up   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes wp-intro     { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes wp-grow      { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes wp-land      { 0% { opacity: 0; transform: translateY(-70px) scale(.85); } 70% { opacity: 1; transform: translateY(6px) scale(1.02); } 100% { opacity: 1; transform: none; } }
        @keyframes wp-crown     { 0% { opacity: 0; transform: translateY(-36px) rotate(-18deg) scale(.5); } 70% { opacity: 1; transform: translateY(3px) rotate(4deg) scale(1.1); } 100% { opacity: 1; transform: none; } }
        @keyframes wp-shock     { from { opacity: .8; transform: scale(.6); } to { opacity: 0; transform: scale(2.2); } }
        @keyframes wp-glow      { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wp-fall {
          0%   { opacity: 0; transform: translate3d(0,-8vh,0) rotate(0); }
          6%   { opacity: 1; }
          100% { opacity: 1; transform: translate3d(var(--sx),108vh,0) rotate(var(--r)); }
        }
        .wp-dialog   { animation: wp-dialog-in .5s cubic-bezier(.2,.9,.25,1) both; }
        .wp-intro    { animation: wp-intro ${tFirst}s ease-in-out .2s both; }
        .wp-up       { animation: wp-fade-up .7s cubic-bezier(.2,.9,.25,1) both; }
        .wp-block    { transform-origin: bottom; animation: wp-grow .6s cubic-bezier(.2,.9,.25,1) both; }
        .wp-land     { animation: wp-land .8s cubic-bezier(.2,.9,.25,1) both; }
        .wp-crown    { animation: wp-crown .8s cubic-bezier(.3,1.4,.5,1) both; }
        .wp-shock    { animation: wp-shock 1.3s ease-out both; }
        .wp-glow     { animation: wp-glow 1.2s ease-out both; }
        .wp-confetti {
          position: absolute; top: 0; border-radius: 2px; background: var(--c);
          opacity: 0; animation: wp-fall 4s linear both;
        }
        @media (prefers-reduced-motion: reduce) {
          .wp-dialog, .wp-up, .wp-block, .wp-land, .wp-crown { animation: none; }
          .wp-fx, .wp-intro, .wp-shock, .wp-glow { display: none; }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Winners announcement"
        className="wp-dialog relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/10 px-4 pb-6 pt-12 shadow-2xl shadow-black/50 sm:px-8"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #5b1763 0%, #240a2b 55%, #12041a 100%)",
        }}
      >
        {/* Spotlight: 1st ke reveal par roshan hoti hai */}
        <div
          aria-hidden
          className="wp-glow wp-fx pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{ animationDelay: `${tFirst}s` }}
        >
          <div
            className="mx-auto h-full w-[70%] bg-gradient-to-b from-amber-200/25 via-amber-200/5 to-transparent"
            style={{ clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }}
          />
        </div>

        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header: pehle intro, reveal ke baad congratulations */}
        <div className="relative z-10 grid min-h-[4rem] place-items-center text-center sm:min-h-[4.5rem]">
          <p className="wp-intro col-start-1 row-start-1 font-serif text-lg italic text-fuchsia-100/90 sm:text-xl">
            And the winners are…
          </p>
          <div
            className="wp-up col-start-1 row-start-1"
            style={{ animationDelay: `${tFirst + 0.4}s` }}
          >
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Congratulations to our winners
            </h2>
            <p className="mt-2 text-xs text-fuchsia-100/70 sm:text-sm">
              Voting is now closed. Thank you to everyone who voted.
            </p>
          </div>
        </div>

        {/* Podium */}
        <ul className="relative z-10 mt-6 flex items-end justify-center gap-2 sm:gap-4">
          {display.map(({ w, i }) => {
            const m = MEDAL[w.rank] ?? MEDAL_DEFAULT;
            const d = delayOf(i);
            const first = w.rank === 1;
            return (
              <li
                key={w.student._id}
                className="flex min-w-0 max-w-[9rem] flex-1 flex-col items-center"
              >
                <div
                  className="wp-land flex w-full flex-col items-center"
                  style={{ animationDelay: `${d + 0.35}s` }}
                >
                  {first && (
                    <Crown
                      className="wp-crown mb-1 h-6 w-6 text-amber-300 drop-shadow sm:h-7 sm:w-7"
                      style={{ animationDelay: `${d + 0.9}s` }}
                    />
                  )}
                  <div className="relative">
                    {first && (
                      <span
                        aria-hidden
                        className="wp-shock wp-fx absolute inset-0 rounded-full border-2 border-amber-300"
                        style={{ animationDelay: `${d + 0.7}s` }}
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.student.imageUrl}
                      alt={w.student.name}
                      className={`rounded-full bg-purple-900 object-cover ring-4 ${m.ring} ${
                        AVATAR[w.rank] ?? "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]"
                      }`}
                    />
                  </div>

                  <p className="mt-3 w-full truncate text-center text-sm font-semibold text-white">
                    {w.student.name}
                  </p>
                  {w.student.department && (
                    <p className="w-full truncate text-center text-[11px] text-fuchsia-100/60 sm:text-xs">
                      {w.student.department}
                    </p>
                  )}
                  <p className="mt-1 w-full truncate text-center text-xs font-semibold text-amber-200 sm:text-sm">
                    {w.student.votes.toLocaleString()}{" "}
                    {w.student.votes === 1 ? "vote" : "votes"}
                  </p>
                  {w.tie && (
                    <p className="mt-0.5 text-[11px] font-medium text-amber-200/90">
                      Co-winner
                    </p>
                  )}
                </div>

                <div
                  className={`wp-block mt-3 flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b pt-2 font-serif text-2xl font-bold sm:text-3xl ${m.block} ${m.text} ${
                    BLOCK_H[w.rank] ?? "h-10 sm:h-14"
                  }`}
                  style={{ animationDelay: `${d}s` }}
                >
                  {w.rank}
                </div>
              </li>
            );
          })}
        </ul>

        <div
          className="wp-up relative z-10 mt-5 text-center"
          style={{ animationDelay: `${tFirst + 1.4}s` }}
        >
          <Link
            href={LEADERBOARD_PATH}
            className="inline-block rounded-full bg-white px-7 py-2 text-sm font-semibold text-[#4a1252] transition hover:bg-fuchsia-50 active:scale-[0.98]"
          >
            See more results
          </Link>
        </div>
      </div>

      <Confetti delay={tFirst + 0.3} />
    </div>
  );
}

export function WinnersPage({
  pairs,
}: {
  pairs: Pair[];
  embedded?: boolean; // purane code se compatible rakha hai, ab use nahi hota
}) {
  const ranked = rankWinners(pairs);
  const [popupOpen, setPopupOpen] = useState(true);

  // Popup band hone ke REOPEN_AFTER_MS baad dobara khul jata hai
  useEffect(() => {
    if (popupOpen) return;
    const t = setTimeout(() => setPopupOpen(true), REOPEN_AFTER_MS);
    return () => clearTimeout(t);
  }, [popupOpen]);

  if (!popupOpen || ranked.length === 0) return null;

  return <CongratsPopup winners={ranked} onClose={() => setPopupOpen(false)} />;
}