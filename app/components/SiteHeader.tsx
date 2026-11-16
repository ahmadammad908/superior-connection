"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import {
  ShieldCheck,
  Home,
  Bookmark,
  User,
  Info,
  FileText,
  MessageCircle,
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";
import { MobileMenu } from "./MobileMenu";
import { NotificationDropdown } from "./NotificationDropdown";
import Superior from "../../public/Analysis output 1.png";

export function SiteHeader() {
  const { user } = useUser();
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID; // Client fallback or visible admin shortcut
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = await res.json();
          setUnreadMessagesCount(data.unreadCount || 0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#6C1C74]/10 bg-white/90 shadow-[0_1px_12px_rgba(108,28,116,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
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
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-[#6C1C74] transition hover:bg-white hover:shadow-sm"
          >
            <Home className="h-4 w-4" />
            Feed
          </Link>
          <Link
            href="/saved"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            <Bookmark className="h-4 w-4" />
            Saved
          </Link>
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Messages
            {unreadMessagesCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6C1C74] px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/about"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-[#6C1C74] hover:shadow-sm"
          >
            About
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Suspense
            fallback={
              <div className="h-9 w-20 animate-pulse rounded-full bg-[#6C1C74]/10" />
            }
          >
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="hidden h-9 items-center rounded-full px-4 text-sm font-medium text-gray-700 transition hover:bg-[#6C1C74]/5 hover:text-[#6C1C74] md:inline-flex"
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
              {/* Admin Button */}
              <Link
                href="/admin"
                aria-label="Admin Dashboard"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[#6C1C74]/20 bg-white px-3 text-xs font-semibold text-[#6C1C74] shadow-sm transition hover:border-[#6C1C74]/40 hover:bg-[#6C1C74]/5 md:inline-flex"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>

              {/* Messages Shortcut */}
              <Link
                href="/messages"
                aria-label="Messages"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#6C1C74]/20 bg-white text-[#6C1C74] transition hover:bg-[#6C1C74]/5"
              >
                <MessageCircle className="h-4 w-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6C1C74] px-1 text-[10px] font-bold text-white shadow-xs">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Button */}
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
export default SiteHeader;
