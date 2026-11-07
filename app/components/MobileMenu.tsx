
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  Info,
  FileText,
  LogIn,
  Trophy,
} from "lucide-react";
import { SignInButton, Show } from "@clerk/nextjs";

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-[#4B5563] transition hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]";

const activeClass = "bg-[#6C1C74]/10 font-semibold text-[#6C1C74]";

function MobileMenuFallback() {
  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        disabled
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#6C1C74]/20 bg-white text-[#6C1C74] shadow-sm"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MobileMenu() {
  return (
    <Suspense fallback={<MobileMenuFallback />}>
      <MobileMenuContent />
    </Suspense>
  );
}

function MobileMenuContent() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const getLinkClass = (href: string) =>
    `${itemClass} ${isActive(href) ? activeClass : ""}`;

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation-menu"
        onClick={() => setOpen((previous) => !previous)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#6C1C74]/20 text-[#6C1C74] shadow-sm transition active:scale-95 ${
          open
            ? "bg-[#6C1C74]/10"
            : "bg-white hover:bg-[#6C1C74]/5"
        }`}
      >
        {open ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          id="mobile-navigation-menu"
          className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-[#6C1C74]/10 bg-white p-2 shadow-xl shadow-[#6C1C74]/10"
        >
          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            onClick={() => setOpen(false)}
            aria-current={isActive("/leaderboard") ? "page" : undefined}
            className={getLinkClass("/leaderboard")}
          >
            <Trophy className="h-4 w-4 text-[#6C1C74]" />
            Leaderboard
          </Link>

          <div className="my-2 h-px bg-[#6C1C74]/10" />

          {/* Information */}
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            aria-current={isActive("/about") ? "page" : undefined}
            className={getLinkClass("/about")}
          >
            <Info className="h-4 w-4 text-[#6C1C74]" />
            About Us
          </Link>

          <Link
            href="/privacy-policy"
            onClick={() => setOpen(false)}
            aria-current={
              isActive("/privacy-policy") ? "page" : undefined
            }
            className={getLinkClass("/privacy-policy")}
          >
            <FileText className="h-4 w-4 text-[#6C1C74]" />
            Privacy Policy
          </Link>

          <div className="my-2 h-px bg-[#6C1C74]/10" />

          {/* Admin */}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            aria-current={isActive("/admin") ? "page" : undefined}
            className={getLinkClass("/admin")}
          >
            <ShieldCheck className="h-4 w-4 text-[#6C1C74]" />
            Admin
          </Link>

          {/* Sign In */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <LogIn className="h-4 w-4 text-[#6C1C74]" />
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      )}
    </div>
  );
}
