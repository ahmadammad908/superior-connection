
import { Suspense } from "react";
import Link from "next/link";
import { ActivePairSection } from "./ActivePairSection";
import { SiteHeader } from "../app/components/SiteHeader";
import { VotingSkeleton } from "../app/components/VotingSkeleton";
import Footer from "../app/components/Footer";
import WelcomePopup from "../app/components/WelcomePopup";
import { Trophy, Crown, GraduationCap, Heart, ArrowRight } from "lucide-react";
import Countdown from "./components/Countdown";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <WelcomePopup />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <header className="text-center">
          <Countdown />

          {/* Boys Voting Congratulations Message */}
          <div className="mb-6 mt-6 rounded-2xl border border-[#6C1C74]/20 bg-[#6C1C74]/5 px-6 py-6 text-center">
            <h2 className="text-2xl font-extrabold text-[#6C1C74] sm:text-3xl">
              🎉 Congratulations, Boys! 🏆
            </h2>

            <p className="mt-2 text-sm font-medium text-gray-700 sm:text-base">
              You Did It! You Are the Winners! 💜
              Congratulations to all the boys for this amazing victory.
            </p>

            {/* See More Results Button */}
            <Link
              href="/leaderboard"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#6C1C74]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#57165E] hover:shadow-xl"
            >
              See More Results
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#6C1C74]">
            💜 Every Vote Matters 💜
          </p>


       <p className="mx-auto mt-4 max-w-lg text-sm text-gray-600 sm:text-base">
  <strong className="text-[#6C1C74]">Boys&apos; Voting</strong> has officially
  ended! Thank you to everyone who cast their vote and supported their
  favorites. Every participant was special and every vote made this event
  exciting. Congratulations to all our winners! 💜
</p>
        </header>

        <Suspense fallback={<VotingSkeleton showCounter={false} />}>
          <ActivePairSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
