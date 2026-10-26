import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck, Trophy } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { MobileMenu } from "./MobileMenu";
import Superior from "../../public/Superior.webp";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#6C1C74]/10 bg-white/80 shadow-[0_1px_12px_rgba(108,28,116,0.06)] backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 shrink items-center">
          <img
            src={Superior.src}
            width={Superior.width}
            height={Superior.height}
            alt="Superior"
            className="h-8 w-auto max-w-[120px] object-contain sm:h-10 sm:max-w-[160px]"
          />
        </Link>

        {/* Desktop nav (pill style) */}
        <nav className="hidden items-center gap-1 rounded-full bg-[#6C1C74]/5 p-1 md:flex">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-[#6C1C74] transition hover:bg-white hover:shadow-sm"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            href="/about"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-[#4B5563] transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            About Us
          </Link>
          <Link
            href="/privacy-policy"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-[#4B5563] transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            Privacy Policy
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Admin: sirf desktop par bahar, mobile par menu ke andar */}
          <Link
            href="/admin"
            aria-label="Admin"
            className="hidden h-9 items-center gap-2 rounded-full border border-[#6C1C74]/20 bg-white px-3 text-sm font-medium text-[#6C1C74] shadow-sm transition hover:border-[#6C1C74]/40 hover:bg-[#6C1C74]/5 md:inline-flex"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>

          <Suspense
            fallback={
              <div className="h-9 w-20 animate-pulse rounded-full bg-[#6C1C74]/10" />
            }
          >
            <Show when="signed-out">
              {/* Sign In: sirf desktop par bahar, mobile par menu ke andar */}
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="hidden h-9 items-center rounded-full px-4 text-sm font-medium text-[#4B5563] transition hover:bg-[#6C1C74]/5 hover:text-[#6C1C74] md:inline-flex"
                >
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="h-9 whitespace-nowrap rounded-full bg-[#6C1C74] px-4 text-sm font-semibold text-white shadow-md shadow-[#6C1C74]/25 transition hover:-translate-y-0.5 hover:bg-[#6C1C74]/90 hover:shadow-lg sm:px-5"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-[#6C1C74]/30 hover:ring-[#6C1C74] transition",
                  },
                }}
              />
            </Show>
          </Suspense>

          {/* Mobile menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}