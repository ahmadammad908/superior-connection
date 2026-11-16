import Link from "next/link";
import {
  ShieldCheck,
  Home,
  Bookmark,
  User,
  Info,
  FileText,
  LockKeyhole,
  GraduationCap,
} from "lucide-react";
import Superior from "../../public/Analysis output 1.png";

const platformLinks = [
  { label: "Campus Feed", href: "/", icon: Home },
  { label: "Saved Posts", href: "/saved", icon: Bookmark },
  { label: "Student Profile", href: "/profile", icon: User },
  { label: "Admin Panel", href: "/admin", icon: ShieldCheck },
];

const informationLinks = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Privacy Policy", href: "/privacy-policy", icon: FileText },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#6C1C74]/10 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.7fr] lg:gap-16">
          {/* Logo and Description */}
          <div className="max-w-xl">
            <Link href="/" className="inline-block">
              <img
                src={Superior.src}
                alt="Superior Connection"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              The official one-window university social network for Superior students.
              Discuss campus problems, academics, hostels, transport, fees, exams,
              and connect with fellow peers in a safe, moderated community.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6C1C74]">
                <GraduationCap className="h-4 w-4" />
                <span>University Only</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6C1C74]">
                <ShieldCheck className="h-4 w-4" />
                <span>Moderated & Safe</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6C1C74]">
                <LockKeyhole className="h-4 w-4" />
                <span>Anonymous Option</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C1C74]">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {platformLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#6C1C74]"
                    >
                      <Icon className="h-4 w-4 text-[#6C1C74]/60" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C1C74]">
              Information
            </h3>
            <ul className="mt-4 space-y-2.5">
              {informationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#6C1C74]"
                    >
                      <Icon className="h-4 w-4 text-[#6C1C74]/60" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#6C1C74]/10 pt-6 text-center text-xs text-gray-500">
          © 2026 Superior. All rights reserved. Built for university students.
        </div>
      </div>
    </footer>
  );
}
