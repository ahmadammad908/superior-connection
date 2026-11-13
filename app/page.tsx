import { Suspense } from "react";
import { ActivePairSection } from "./ActivePairSection";
import { SiteHeader } from "../app/components/SiteHeader";
import { VotingSkeleton } from "../app/components/VotingSkeleton";
import Footer from "../app/components/Footer";
import WelcomePopup from "../app/components/WelcomePopup";
import { Trophy, Crown, GraduationCap, Heart } from "lucide-react";
import Countdown from "./components/Countdown"; // apna sahi path likhein

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <WelcomePopup />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <header className="text-center">
                    <Countdown />


          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#6C1C74]">
            💜 Every Vote Matters 💜
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            One Campus, <span className="text-[#6C1C74]">Many Stars!</span> ✨
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-gray-600 sm:text-base">
            <strong className="text-[#6C1C74]">Boys&apos; Voting</strong> is
            finally here! Cast your vote, support your favorite, and be part of
            the excitement. Remember, every participant is special and every
            vote is just for fun. Let the best one shine! 💜
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
