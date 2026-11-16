import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  MessageSquare,
  UsersRound,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";

const features = [
  {
    icon: GraduationCap,
    title: "University-Only Focus",
    description:
      "A dedicated, authentic space for students of Superior to share experiences, ask questions, and solve campus problems together.",
  },
  {
    icon: MessageSquare,
    title: "Problem Discussions",
    description:
      "Voice concerns regarding academics, hostel living, bus transport, fees, examination schedules, and campus facilities directly.",
  },
  {
    icon: EyeOff,
    title: "Anonymous Freedom",
    description:
      "Optionally post anonymously when discussing sensitive campus challenges, while maintaining administrative accountability.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Moderation",
    description:
      "Monitored by university moderators to prevent harassment, ensure safe discussions, and broadcast verified official notices.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6C1C74]/20 bg-[#6C1C74]/5 px-4 py-1.5 text-xs font-bold text-[#6C1C74]">
            <Sparkles className="h-3.5 w-3.5" />
            ABOUT SUPERIOR CONNECTION
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            The One-Window Platform for{" "}
            <span className="text-[#6C1C74]">Superior Students</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
            Superior Connection is a university-exclusive social media platform designed
            to bridge communication across departments, empower student voices, and resolve
            campus issues through collective discussions and verified moderation.
          </p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-xs space-y-2 hover:border-[#6C1C74]/30 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6C1C74]/10 text-[#6C1C74]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Call to action */}
        <section className="rounded-3xl border border-[#6C1C74]/20 bg-[#6C1C74] p-8 text-center text-white shadow-xl shadow-[#6C1C74]/20">
          <h2 className="text-xl sm:text-2xl font-bold">Have a campus issue or question?</h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-md mx-auto">
            Join fellow students on the feed, explore category tags, and participate in discussions today.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-[#6C1C74] shadow-md hover:bg-gray-100 transition"
          >
            <span>Explore Campus Feed</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
