"use client";

import { useCallback, useEffect, useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  SkipForward,
  Vote,
  Trophy,
  UserPlus,
  WifiOff,
  ServerCrash,
  Check,
  Hourglass,
  RefreshCw,
  X,
} from "lucide-react";
import { StudentCard } from "./StudentCard";
import { VotingSkeleton } from "../components/VotingSkeleton";

type Student = {
  _id: string;
  name: string;
  department?: string;
  imageUrl: string;
};

type Counts = { left: number; right: number };

export type Pair = {
  _id: string;
  leftId: Student;
  rightId: Student;
  counts?: Counts;
};

type Side = "left" | "right";
type Status = "idle" | "voted" | "already";
type ErrorKind = "inactive" | "network" | "server" | "generic";
type ErrorInfo = { kind: ErrorKind; message: string };

const TOAST_MS = 5000;

/* ---------- Toast: sign up to vote ---------- */

function AuthToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, TOAST_MS);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:top-24"
    >
      <style>{`
        @keyframes auth-toast-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
        @keyframes auth-toast-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .auth-toast { animation: auth-toast-in 0.25s ease-out; }
        .auth-toast-bar { animation: auth-toast-bar ${TOAST_MS}ms linear forwards; }
        @media (prefers-reduced-motion: reduce) {
          .auth-toast { animation: none; }
        }
      `}</style>

      <div className="auth-toast pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl shadow-purple-200/60">
        <div className="flex items-start gap-3 p-3.5 pr-10">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500 text-white shadow-md shadow-purple-200">
            <UserPlus className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Please sign up to vote
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Sign up or sign in to cast your vote.
            </p>

            <div className="mt-2.5 flex gap-2">
              <SignUpButton mode="modal">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Sign up
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[#6C1C74]/30 px-4 py-1.5 text-xs font-semibold text-[#6C1C74] transition hover:bg-purple-50"
                >
                  Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Auto-close progress bar */}
        <div className="h-1 w-full bg-purple-50">
          <div className="auth-toast-bar h-full bg-[#6C1C74]" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Vote stats ---------- */

function VoteStats({ votes, other }: { votes: number; other: number }) {
  const total = votes + other;
  const percent = total === 0 ? 0 : Math.round((votes / total) * 100);
  const state = votes === other ? "tied" : votes > other ? "winning" : "losing";

  const styles = {
    winning: {
      badge: "bg-green-100 text-green-700",
      bar: "bg-gradient-to-r from-green-400 to-green-600",
      label: "Winning",
    },
    losing: {
      badge: "bg-red-100 text-red-600",
      bar: "bg-gradient-to-r from-red-300 to-red-500",
      label: "Losing",
    },
    tied: {
      badge: "bg-gray-100 text-gray-600",
      bar: "bg-gradient-to-r from-gray-300 to-gray-400",
      label: "Tied",
    },
  }[state];

  return (
    <div className="mt-2 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:mt-3 sm:rounded-2xl sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-1">
        <div>
          <p className="text-xl font-bold leading-none tracking-tight sm:text-3xl">
            {votes}
          </p>
          <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
            {votes === 1 ? "vote" : "votes"} · {percent}%
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${styles.badge}`}
        >
          {state === "winning" && <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          {styles.label}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:mt-3 sm:h-2.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${styles.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Error banner ---------- */

function ErrorBanner({ error }: { error: ErrorInfo }) {
  const Icon =
    error.kind === "network" ? WifiOff : error.kind === "server" ? ServerCrash : AlertCircle;

  return (
    <div className="inline-flex max-w-md items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{error.message}</span>
    </div>
  );
}

/* ---------- Main ---------- */

export function VotingCards({
  initialPair,
  initialVotedCount = 0,
}: {
  initialPair: Pair | null;
  initialVotedCount?: number;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  const [pair, setPair] = useState<Pair | null>(initialPair);
  const [counts, setCounts] = useState<Counts>(
    initialPair?.counts ?? { left: 0, right: 0 }
  );
  const [votedCount, setVotedCount] = useState(initialVotedCount);
  const [picked, setPicked] = useState<Side | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // authToast = timestamp; naya timestamp = toast dobara shuru (timer reset)
  const [authToast, setAuthToast] = useState<number | null>(null);
  const showAuthToast = () => setAuthToast(Date.now());
  const closeAuthToast = useCallback(() => setAuthToast(null), []);

  // skipCurrent = true -> maujooda pair ko skip list mein daal ke agli pair lao
  async function fetchNextPair(skipCurrent = false) {
    setLoading(true);
    setFetchingNext(true);
    setError(null);
    setNotice(null);

    const ids =
      skipCurrent && pair && !skipped.includes(pair._id)
        ? [...skipped, pair._id]
        : skipped;

    try {
      const qs = ids.length ? `?skip=${ids.join(",")}` : "";
      const res = await fetch(`/api/pairs/next${qs}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({
          kind: "server",
          message: "Could not load the next pair. Please try again.",
        });
        return;
      }

      if (data.recycled) {
        // Saari pairs dekh li, list reset karo
        setSkipped([]);
        setNotice("You've gone through all the pairs, so we're starting over.");
      } else {
        setSkipped(ids);
      }

      setPair(data.pair || null);
      setCounts(data.pair?.counts ?? { left: 0, right: 0 });
      if (typeof data.votedCount === "number") setVotedCount(data.votedCount);
      setPicked(null);
      setStatus("idle");
    } catch {
      setError({
        kind: "network",
        message: "No internet connection. Check your network and try again.",
      });
    } finally {
      setLoading(false);
      setFetchingNext(false);
    }
  }

  async function handleVote(side: Side) {
    if (!pair || loading || status !== "idle") return;

    // Login nahi hai -> server ko bulaye bina toast dikhao
    if (isLoaded && !isSignedIn) {
      setError(null);
      showAuthToast();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairId: pair._id,
          selectedStudentId: side === "left" ? pair.leftId._id : pair.rightId._id,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.counts) setCounts(data.counts);

      if (res.ok) {
        setVotedCount((c) => c + 1);
        setPicked(side);
        setStatus("voted");
        return;
      }

      // Backup: server ne login nahi mana
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        showAuthToast();
        return;
      }

      if (res.status === 409 || data.code === "ALREADY_VOTED") {
        setStatus("already");
        return;
      }

      if (data.code === "PAIR_INACTIVE" || data.code === "PAIR_NOT_FOUND") {
        setError({
          kind: "inactive",
          message: data.error || "This pair is no longer available.",
        });
        return;
      }

      if (res.status >= 500) {
        setError({
          kind: "server",
          message: data.error || "Something went wrong on our side. Please try again.",
        });
        return;
      }

      setError({
        kind: "generic",
        message: data.error || "Your vote could not be recorded.",
      });
    } catch {
      setError({
        kind: "network",
        message: "No internet connection. Check your network and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Empty state ke liye simple counter
  const counter = (
    <div className="mb-6 flex justify-center sm:mb-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-1.5 text-xs font-medium text-[#6C1C74] shadow-sm sm:px-5 sm:py-2 sm:text-sm">
        <Vote className="h-4 w-4" />
        You've voted on {votedCount} {votedCount === 1 ? "pair" : "pairs"}
      </span>
    </div>
  );

  // ---------- Empty state: no active pair ----------
  if (!pair) {
    return (
      <div>
        {votedCount > 0 && counter}

        <div className="relative mx-auto mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/60">
          {/* Top accent strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#6C1C74] via-purple-400 to-[#6C1C74]" />

          {/* Soft background glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-purple-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-fuchsia-100/70 blur-3xl" />

          <div className="relative flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
            {/* Animated icon */}
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-purple-200/60 [animation-duration:2.5s]" />
              <span className="absolute inset-2 rounded-full bg-purple-100/80" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6C1C74] to-purple-500 shadow-lg shadow-purple-300/60">
                <Hourglass className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Status pill */}
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Waiting for next pair
            </span>

            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              No active pairs right now
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
              All current pairs are done. A new pair will appear here as soon as
              the admin activates it.
            </p>

            {/* Divider */}
            <div className="my-6 h-px w-full max-w-[220px] bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

            {/* Refresh button */}
            <button
              onClick={() => fetchNextPair()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking…" : "Check again"}
            </button>

            <p className="mt-4 text-xs text-gray-400">
              Tip: come back in a little while to vote on new pairs.
            </p>

            {error && (
              <div className="mt-5 flex w-full justify-center">
                <ErrorBanner error={error} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Loading state: next / skip ke baad ----------
  if (fetchingNext) {
    return <VotingSkeleton label="Loading next pair…" />;
  }

  // ---------- Main voting UI ----------
  const locked = loading || status !== "idle";
  const showNext = status !== "idle" || error?.kind === "inactive";
  const showSkip = !showNext; // vote se pehle skip, vote ke baad "Next pair"

  const sides: { side: Side; student: Student; votes: number; other: number }[] = [
    { side: "left", student: pair.leftId, votes: counts.left, other: counts.right },
    { side: "right", student: pair.rightId, votes: counts.right, other: counts.left },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-1 sm:px-0">
      {authToast !== null && (
        <AuthToast key={authToast} onClose={closeAuthToast} />
      )}

      {/* Top bar: counter + skip / next (hamesha nazar aata hai) */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-purple-100 bg-white px-3 py-1.5 text-xs font-medium text-[#6C1C74] shadow-sm sm:px-5 sm:py-2 sm:text-sm">
          <Vote className="h-4 w-4 shrink-0" />
          <span className="truncate sm:hidden">{votedCount} voted</span>
          <span className="hidden truncate sm:inline">
            You've voted on {votedCount} {votedCount === 1 ? "pair" : "pairs"}
          </span>
        </span>

        {showSkip ? (
          <button
            onClick={() => fetchNextPair(true)}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#6C1C74]/30 bg-white px-4 py-1.5 text-xs font-semibold text-[#6C1C74] shadow-sm transition hover:-translate-y-0.5 hover:border-[#6C1C74] hover:bg-purple-50 disabled:translate-y-0 disabled:opacity-50 sm:px-5 sm:py-2 sm:text-sm"
          >
            <SkipForward className="h-4 w-4" />
            Skip pair
          </button>
        ) : (
          <button
            onClick={() => fetchNextPair()}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-200 transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-50 sm:px-5 sm:py-2 sm:text-sm"
          >
            Next pair
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSkip && (
        <p className="mb-5 text-center text-xs text-gray-500 sm:mb-8">
          Pick one, or skip if you can't decide.
        </p>
      )}
      {!showSkip && <div className="mb-5 sm:mb-8" />}

      {notice && (
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-1.5 text-xs font-medium text-purple-700">
            <RefreshCw className="h-3.5 w-3.5" /> {notice}
          </span>
        </div>
      )}

      {/* Always two columns, on mobile too */}
      <div
        className={`relative grid grid-cols-2 gap-4 transition-opacity sm:gap-8 ${
          loading && status !== "idle" ? "opacity-60" : "opacity-100"
        }`}
      >
        {sides.map(({ side, student, votes, other }) => (
          <div
            key={side}
            className={`relative min-w-0 rounded-2xl p-0 transition sm:rounded-3xl sm:p-3 ${
              picked === side
                ? "bg-purple-50/70 ring-2 ring-[#6C1C74]"
                : "bg-transparent ring-1 ring-transparent"
            }`}
          >
            {picked === side && (
              <span className="absolute -top-2.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#6C1C74] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md sm:-top-3 sm:px-3 sm:py-1 sm:text-xs">
                <Check className="h-3 w-3" /> Your pick
              </span>
            )}
            <StudentCard
              student={student}
              side={side}
              disabled={locked}
              onVote={handleVote}
            />
            <VoteStats votes={votes} other={other} />
          </div>
        ))}

        {/* VS badge, centered between the two columns */}
        <div className="pointer-events-none absolute left-1/2 top-[22%] z-10 -translate-x-1/2 -translate-y-1/2 sm:top-1/3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C1C74] text-[10px] font-extrabold tracking-wide text-white shadow-lg shadow-purple-300 ring-2 ring-white sm:h-12 sm:w-12 sm:text-sm sm:ring-4">
            VS
          </div>
        </div>
      </div>

      <div className="mt-6 flex min-h-[48px] flex-col items-center gap-4 text-center sm:mt-8">
        {loading && (
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Working…
          </span>
        )}

        {status === "voted" && (
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Your vote has been recorded!
          </span>
        )}

        {status === "already" && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <AlertCircle className="h-4 w-4" /> You have already voted on this pair.
          </span>
        )}

        {error && <ErrorBanner error={error} />}

        {/* Vote ke baad: neeche bhi Next pair */}
        {showNext && (
          <button
            onClick={() => fetchNextPair()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-50"
          >
            Next pair <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}