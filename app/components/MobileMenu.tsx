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
  Home,
  Bookmark,
  User,
  LogIn,
  MessageCircle,
} from "lucide-react";
import { SignInButton, Show } from "@clerk/nextjs";

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]";

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
          open ? "bg-[#6C1C74] text-white" : "bg-white hover:bg-[#6C1C74]/5"
        }`}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          id="mobile-navigation-menu"
          className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-[#6C1C74]/15 bg-white p-2.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <nav className="flex flex-col gap-1">
            <Link href="/" className={getLinkClass("/")}>
              <Home className="h-4 w-4 text-[#6C1C74]" />
              <span>Campus Feed</span>
            </Link>

            <Link href="/saved" className={getLinkClass("/saved")}>
              <Bookmark className="h-4 w-4 text-[#6C1C74]" />
              <span>Saved Posts</span>
            </Link>

            <Link href="/messages" className={getLinkClass("/messages")}>
              <MessageCircle className="h-4 w-4 text-[#6C1C74]" />
              <span>Messages</span>
            </Link>

            <Link href="/profile" className={getLinkClass("/profile")}>
              <User className="h-4 w-4 text-[#6C1C74]" />
              <span>My Profile</span>
            </Link>

            <div className="my-1 border-t border-[#6C1C74]/10" />

            <Link href="/admin" className={getLinkClass("/admin")}>
              <ShieldCheck className="h-4 w-4 text-[#6C1C74]" />
              <span>Admin Panel</span>
            </Link>

            <Link href="/about" className={getLinkClass("/about")}>
              <Info className="h-4 w-4 text-gray-400" />
              <span>About Us</span>
            </Link>

            <Link
              href="/privacy-policy"
              className={getLinkClass("/privacy-policy")}
            >
              <FileText className="h-4 w-4 text-gray-400" />
              <span>Privacy Policy</span>
            </Link>

            <Show when="signed-out">
              <div className="my-1 border-t border-[#6C1C74]/10" />
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-[#6C1C74] transition hover:bg-[#6C1C74]/5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            </Show>
          </nav>
        </div>
      )}
    </div>
  );
}
