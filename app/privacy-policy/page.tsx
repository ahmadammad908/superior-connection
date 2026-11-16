import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  Database,
  UserCheck,
  Mail,
  FileText,
  EyeOff,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";

const policyPoints = [
  {
    icon: Database,
    title: "Information We Collect",
    desc: "We collect your student profile details (name, username, department, semester, bio, and avatar) upon authentication via Clerk. When you create discussions, upload media, or submit comments, those inputs are stored securely in our university database.",
  },
  {
    icon: EyeOff,
    title: "Anonymous Posts & Privacy",
    desc: "When you select 'Post Anonymously', your name and profile picture are masked from all fellow students across the feed and search results. However, university administrators retain back-end visibility to prevent harassment, academic dishonesty, and abuse.",
  },
  {
    icon: LockKeyhole,
    title: "Media Storage & Cloudinary",
    desc: "Images and videos uploaded to discussions are stored securely using Cloudinary. Media files are scanned to prevent malicious or prohibited content and are strictly university-related.",
  },
  {
    icon: UserCheck,
    title: "Moderation & Student Safety",
    desc: "Superior moderators enforce campus community guidelines. If content violates policies, it may be removed, and the offending student account may be issued an official warning or temporary/permanent suspension.",
  },
  {
    icon: ShieldCheck,
    title: "Your Rights & Control",
    desc: "You can edit or delete your own posts and comments at any time. You can update your profile details or change your avatar whenever needed.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 sm:py-16 space-y-10">
        <section className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6C1C74]/20 bg-[#6C1C74]/5 px-4 py-1.5 text-xs font-bold text-[#6C1C74]">
            <ShieldCheck className="h-3.5 w-3.5" />
            CAMPUS PRIVACY POLICY
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Privacy & Community Standards
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-gray-600 leading-relaxed">
            Superior Connection is committed to safeguarding student privacy while maintaining
            a respectful, constructive environment for campus discussions and problem solving.
          </p>
        </section>

        <section className="space-y-4">
          {policyPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C1C74]/10 text-[#6C1C74]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    {item.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-12">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
          For privacy inquiries or compliance questions, contact the Superior campus administration desk or submit a moderation report through the post options menu.
        </section>
      </main>

      <Footer />
    </div>
  );
}
