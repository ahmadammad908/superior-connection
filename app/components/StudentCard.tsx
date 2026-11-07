"use client";

import { ThumbsUp, GraduationCap } from "lucide-react";

// Change this to "classic" | "overlay" | "profile"
const VARIANT: "classic" | "overlay" | "profile" = "classic";

type Props = {
  student: { _id: string; name: string; department?: string; imageUrl: string };
  side: "left" | "right";
  disabled: boolean;
  onVote: (side: "left" | "right") => void;
};

function DeptChip({ text, tone }: { text: string; tone: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs ${tone}`}
    >
      <GraduationCap className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
      <span className="truncate">{text}</span>
    </span>
  );
}

const SOFT_TONE =
  "bg-gradient-to-r from-purple-50 to-fuchsia-50 text-[#6C1C74] ring-1 ring-purple-100";
const GLASS_TONE = "bg-white/20 text-white ring-1 ring-white/30 backdrop-blur";

export function StudentCard({ student, side, disabled, onVote }: Props) {
  const firstName = student.name.split(" ")[0];

  const voteBtn = (extra = "") => (
    <button
      onClick={() => onVote(side)}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm ${extra}`}
    >
      <ThumbsUp className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
      <span className="sm:hidden">Vote</span>
      <span className="hidden truncate sm:inline">Vote for {firstName}</span>
    </button>
  );

  /* ---------- 1. CLASSIC ---------- */
  if (VARIANT === "classic") {
    return (
      <div className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-purple-100/70 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-200/70 sm:rounded-3xl">
        <div className="relative aspect-square w-full overflow-hidden bg-purple-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.imageUrl}
            alt={student.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        <div className="p-2.5 text-center sm:p-4">
          <h3 className="truncate text-sm font-bold tracking-tight text-gray-900 sm:text-lg">
            {student.name}
          </h3>

          {/* Department: naam ke neeche. min-h se dono cards ke buttons barabar rehte hain */}
          <div className="mt-1.5 flex min-h-[20px] justify-center sm:mt-2 sm:min-h-[26px]">
            {student.department && (
              <DeptChip text={student.department} tone={SOFT_TONE} />
            )}
          </div>

          <div className="mt-2.5 sm:mt-3.5">
            {voteBtn(
              "bg-[#6C1C74] text-white shadow-md shadow-purple-200 hover:opacity-90"
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 2. OVERLAY ---------- */
  if (VARIANT === "overlay") {
    return (
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-purple-50 shadow-xl shadow-purple-200/60 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={student.imageUrl}
          alt={student.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute inset-x-2 bottom-2 rounded-xl border border-white/20 bg-white/15 p-2.5 text-center backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-4">
          <h3 className="truncate text-sm font-bold text-white drop-shadow sm:text-lg">
            {student.name}
          </h3>

          <div className="mt-1.5 flex min-h-[20px] justify-center sm:mt-2 sm:min-h-[26px]">
            {student.department && (
              <DeptChip text={student.department} tone={GLASS_TONE} />
            )}
          </div>

          <div className="mt-2 sm:mt-3">
            {voteBtn("bg-white text-[#6C1C74] shadow-lg hover:bg-purple-50")}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 3. PROFILE ---------- */
  return (
    <div className="group rounded-2xl bg-white p-2 shadow-lg shadow-purple-100/70 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-200/70 sm:rounded-3xl sm:p-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-purple-50 sm:rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={student.imageUrl}
          alt={student.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="px-1 pb-1 pt-3 text-center sm:px-3 sm:pb-3 sm:pt-4">
        <h3 className="truncate text-sm font-bold tracking-tight text-gray-900 sm:text-lg">
          {student.name}
        </h3>

        <div className="mt-1.5 flex min-h-[20px] justify-center sm:mt-2 sm:min-h-[26px]">
          {student.department && (
            <DeptChip text={student.department} tone={SOFT_TONE} />
          )}
        </div>

        <div className="mt-3 sm:mt-4">
          {voteBtn(
            "border-2 border-[#6C1C74] text-[#6C1C74] hover:bg-[#6C1C74] hover:text-white"
          )}
        </div>
      </div>
    </div>
  );
}