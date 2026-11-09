import { Suspense } from "react";
import { ActivePairSection } from "./ActivePairSection";
import { SiteHeader } from "../app/components/SiteHeader";
import { VotingSkeleton } from "../app/components/VotingSkeleton";
import Footer from "../app/components/Footer";
import WelcomePopup from "../app/components/WelcomePopup";
import { Trophy, Crown, GraduationCap ,Heart} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6C1C74]/5 via-white to-white">
      <WelcomePopup />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#6C1C74] text-white shadow-lg shadow-purple-300">
            <Trophy className="h-8 w-8" />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#6C1C74]">
            🎉 Results Are In 🎉
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Congratulations to Our{" "}
            <span className="text-[#6C1C74]">Winners!</span> 🏆
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-gray-600 sm:text-base">
            Thank you to everyone who voted and cheered for their favourites.
            Huge congratulations to all our winners and to every participant
            who made this campus event so special. You are all stars!
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