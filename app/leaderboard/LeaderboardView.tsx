"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Trophy,
  Vote,
  Layers,
  Radio,
  RefreshCw,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

type PairSide = {
  _id: string;
  name: string;
  department: string | null;
  imageUrl: string | null;
  votes: number;
};

type PairRow = {
  _id: string;
  active: boolean;
  left: PairSide;
  right: PairSide;
  total: number;
  winner: "left" | "right" | "tie";
};

type Data = {
  totals: { votes: number; pairs: number; live: number };
  pairs: PairRow[];
  updatedAt: string;
};

const REFRESH_MS = 20000;

/* ---------- small pieces ---------- */

function Avatar({
  name,
  src,
  className = "",
}: {
  name: string;
  src: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#6C1C74] to-purple-400 font-bold text-white ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-3 text-center shadow-sm sm:p-4">
      <Icon className="mx-auto h-4 w-4 text-[#6C1C74] sm:h-5 sm:w-5" />
      <p className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-gray-500 sm:text-xs">{label}</p>
    </div>
  );
}

/* ---------- pairs ---------- */

function PairSideView({ s, win }: { s: PairSide; win: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative">
        <Avatar
          name={s.name}
          src={s.imageUrl}
          className={`h-14 w-14 rounded-full sm:h-16 sm:w-16 ${
            win ? "ring-4 ring-green-400" : "ring-2 ring-gray-100"
          }`}
        />
        {win && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow">
            <Trophy className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 w-full truncate text-xs font-semibold text-gray-900 sm:text-sm">
        {s.name}
      </p>
      {s.department && (
        <p className="w-full truncate text-[10px] text-gray-400 sm:text-xs">
          {s.department}
        </p>
      )}
      <p className="mt-1 text-lg font-bold leading-tight text-[#6C1C74] sm:text-xl">
        {s.votes}
      </p>
      <p className="text-[10px] text-gray-500 sm:text-xs">
        {s.votes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}

function PairItem({ p }: { p: PairRow }) {
  const leftPct = p.total === 0 ? 0 : Math.round((p.left.votes / p.total) * 100);
  const rightPct = p.total === 0 ? 0 : 100 - leftPct;

  return (
    <li className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          {p.total} {p.total === 1 ? "vote" : "votes"} total
        </span>
        {p.active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            Live
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
            Ended
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <PairSideView s={p.left} win={p.winner === "left" && p.total > 0} />
        <span className="text-xs font-extrabold text-gray-300">VS</span>
        <PairSideView s={p.right} win={p.winner === "right" && p.total > 0} />
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="bg-[#6C1C74] transition-all duration-700"
          style={{ width: `${leftPct}%` }}
        />
        <div
          className="bg-fuchsia-300 transition-all duration-700"
          style={{ width: `${rightPct}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold">
        <span className="text-[#6C1C74]">{leftPct}%</span>
        <span className="truncate text-center text-gray-400">
          {p.total === 0
            ? "No votes yet"
            : p.winner === "tie"
            ? "Tied"
            : `${p.winner === "left" ? p.left.name : p.right.name} ${
                p.active ? "is leading" : "won"
              }`}
        </span>
        <span className="text-fuchsia-500">{rightPct}%</span>
      </div>
    </li>
  );
}

/* ---------- loading / empty ---------- */

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-busy="true">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[#6C1C74]/10" />
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-60 rounded-3xl bg-[#6C1C74]/10" />
        ))}
      </div>
      <span className="sr-only">Loading leaderboard…</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-sm">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
        <Trophy className="h-6 w-6 text-purple-400" />
      </span>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

/* ---------- main ---------- */

export function LeaderboardView() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading && !data) return <LeaderboardSkeleton />;

  if (!data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-red-50">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </span>
        <h2 className="text-lg font-semibold">Could not load leaderboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Check your connection and try again.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:opacity-95"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const { pairs, totals } = data;

  return (
    <div>
      {/* Totals */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={Vote} label="Total votes" value={totals.votes} />
        <StatCard icon={Layers} label="Pairs" value={totals.pairs} />
        <StatCard icon={Radio} label="Live now" value={totals.live} />
      </div>

      {/* Pairs */}
      {pairs.length === 0 ? (
        <EmptyState text="No pairs yet." />
      ) : (
        <ul className="space-y-4">
          {pairs.map((p) => (
            <PairItem key={p._id} p={p} />
          ))}
        </ul>
      )}

      {/* Footer */}
      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
        {failed ? (
          <span className="text-amber-600">
            Couldn't refresh — showing last known results.
          </span>
        ) : (
          <>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            Live · updates every {REFRESH_MS / 1000}s ·{" "}
            {new Date(data.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </>
        )}
      </p>
    </div>
  );
}