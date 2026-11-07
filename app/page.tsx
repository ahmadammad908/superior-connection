import { Suspense } from "react";
import { ActivePairSection } from "./ActivePairSection";
import { SiteHeader } from "../app/components/SiteHeader";
import { VotingSkeleton } from "../app/components/VotingSkeleton";
import Footer from "../app/components/Footer";
import WelcomePopup from "../app/components/WelcomePopup";
import { Trophy, Crown, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <WelcomePopup />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        {/* <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#4B5563] sm:text-4xl">
            <span className="text-[#6C1C74]">Vote for the one who stands out with confidence, charm, and personality!</span>
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            Keep it friendly, vote with a smile, and cheer for your campus.
          </p>
        </div> */}
        <header className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#6C1C74] text-white shadow-lg shadow-purple-300">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    Congratulations to our winners!
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 sm:text-base">
                    Voting is now closed. Thank you to everyone who voted.
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