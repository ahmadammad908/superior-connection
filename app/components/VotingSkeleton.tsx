function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton-bone ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="relative min-w-0 rounded-2xl p-0 sm:rounded-3xl sm:p-3">
      {/* Image */}
      <Bone className="aspect-[3/4] w-full rounded-2xl sm:rounded-3xl" />

      {/* Name + department */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <Bone className="h-4 w-3/4 rounded-full sm:h-5" />
        <Bone className="h-3 w-1/2 rounded-full" />
      </div>

      {/* Vote button */}
      <Bone className="mx-auto mt-3 h-9 w-full rounded-full sm:h-11" />

      {/* Stats box */}
      <div className="mt-2 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:mt-3 sm:rounded-2xl sm:p-4">
        <div className="flex items-end justify-between gap-1">
          <div className="space-y-2">
            <Bone className="h-6 w-10 rounded-md sm:h-8 sm:w-14" />
            <Bone className="h-2.5 w-14 rounded-full sm:w-20" />
          </div>
          <Bone className="h-5 w-14 rounded-full sm:h-6 sm:w-20" />
        </div>
        <Bone className="mt-3 h-2 w-full rounded-full sm:h-2.5" />
      </div>
    </div>
  );
}

export function VotingSkeleton({
  label = "Loading pair…",
  showCounter = true,
}: {
  label?: string;
  showCounter?: boolean;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-3xl px-1 sm:px-0"
    >
      <style>{`
        .skeleton-bone {
          position: relative;
          overflow: hidden;
          background: #ece7ee;
        }
        .skeleton-bone::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(108, 28, 116, 0.10),
            rgba(255, 255, 255, 0.75),
            rgba(108, 28, 116, 0.10),
            transparent
          );
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-bone::after { animation: none; }
        }
      `}</style>

      {/* Counter pill */}
      {showCounter && (
        <div className="mb-6 flex justify-center sm:mb-8">
          <Bone className="h-8 w-44 rounded-full sm:h-9 sm:w-52" />
        </div>
      )}

      {/* Two columns, same as the real cards */}
      <div className="relative grid grid-cols-2 gap-4 sm:gap-8">
        <SkeletonCard />
        <SkeletonCard />

        {/* VS badge */}
        <div className="pointer-events-none absolute left-1/2 top-[22%] z-10 -translate-x-1/2 -translate-y-1/2 sm:top-1/3">
          <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-[#6C1C74]/70 text-[10px] font-extrabold tracking-wide text-white ring-2 ring-white sm:h-12 sm:w-12 sm:text-sm sm:ring-4">
            VS
          </div>
        </div>
      </div>

      {/* Bottom status */}
      <div className="mt-6 flex justify-center sm:mt-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6C1C74] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6C1C74] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6C1C74]" />
          </span>
          {label}
        </span>
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}