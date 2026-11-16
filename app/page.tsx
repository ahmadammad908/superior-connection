import { Suspense } from "react";
import { SiteHeader } from "./components/SiteHeader";
import Footer from "./components/Footer";
import { FeedView } from "./components/FeedView";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />
      <main className="flex-1 pb-16">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#6C1C74]" />
            </div>
          }
        >
          <FeedView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
