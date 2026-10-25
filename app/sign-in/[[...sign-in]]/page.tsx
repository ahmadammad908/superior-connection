import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#6C1C74]" />
        }
      >
        <SignIn />
      </Suspense>
    </main>
  );
}