"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, Info, FileText, LogIn } from "lucide-react";
import { SignInButton, Show } from "@clerk/nextjs";

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-[#4B5563] transition hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Page change par menu band
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bahar tap / Escape par menu band
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#6C1C74]/20 text-[#6C1C74] shadow-sm transition active:scale-95 ${
          open ? "bg-[#6C1C74]/10" : "bg-white hover:bg-[#6C1C74]/5"
        }`}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-[#6C1C74]/10 bg-white p-2 shadow-xl shadow-[#6C1C74]/10">
          <Link href="/about" onClick={() => setOpen(false)} className={itemClass}>
            <Info className="h-4 w-4 text-[#6C1C74]" />
            About Us
          </Link>
          <Link
            href="/privacy-policy"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <FileText className="h-4 w-4 text-[#6C1C74]" />
            Privacy Policy
          </Link>

          <div className="my-2 h-px bg-[#6C1C74]/10" />

          <Link href="/admin" onClick={() => setOpen(false)} className={itemClass}>
            <ShieldCheck className="h-4 w-4 text-[#6C1C74]" />
            Admin
          </Link>

          <Suspense fallback={null}>
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
          </Suspense>
        </div>
      )}
    </div>
  );
}