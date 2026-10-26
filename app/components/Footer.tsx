
import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  Trophy,
  Home,
  Info,
  Vote,
} from "lucide-react";
import Superior from '../../public/Superior.webp'
const platformLinks = [
  
  { label: "Vote Battles", href: "/", icon: Vote },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

const informationLinks = [
  { label: "About Us", href: "/about", icon: Info },
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
    icon: ShieldCheck,
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-purple-100 bg-white">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.7fr] lg:gap-16 lg:py-12">
          {/* Logo Space and Description */}
          <div className="max-w-xl">
            <img src={Superior.src} alt="Superior Connection Logo" className="h-14" />
            <div className="h-14" aria-hidden="true" />

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              A community voting platform where people can share their
              preferences, participate in friendly voting battles, and
              explore community favorites through the leaderboard.
            </p>

            {/* Trust Indicators */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[#812991]">
                <ShieldCheck size={21} strokeWidth={1.8} />
                <span>Community Focused</span>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-[#812991]">
                <LockKeyhole size={21} strokeWidth={1.8} />
                <span>Privacy Matters</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#702080]">
              Platform
            </h3>

            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#812991] sm:text-base"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#9B71A6] transition-colors group-hover:text-[#812991]"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#702080]">
              Information
            </h3>

            <ul className="mt-4 space-y-3">
              {informationLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#812991] sm:text-base"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#9B71A6] transition-colors group-hover:text-[#812991]"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Superior Connection. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Made for community connection
            <span className="text-[#812991]" aria-label="love">
              ♥
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
