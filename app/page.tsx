import { Suspense } from "react";
import { ActivePairSection } from "./ActivePairSection";
import { SiteHeader } from "../app/components/SiteHeader";
import { VotingSkeleton } from "../app/components/VotingSkeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#4B5563] sm:text-4xl">
            <span className="text-[#6C1C74]">Who is more beautiful and attractive ?</span>
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            Pick the one you find more beautiful, attractive and sharp. The next pair loads right away.
          </p>
        </div>

        <Suspense fallback={<VotingSkeleton showCounter={false} />}>
          <ActivePairSection />
        </Suspense>
      </main>
    </div>
  );
}