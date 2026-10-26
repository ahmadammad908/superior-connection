
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  Vote,
  Zap,
  Target,
  Eye,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
const features = [
  {
    icon: UsersRound,
    title: "Community First",
    description:
      "Bring people together through shared opinions, friendly participation, and meaningful choices.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible Voting",
    description:
      "We believe every vote should be handled responsibly, with a focus on fairness and trust.",
  },
  {
    icon: Zap,
    title: "Simple & Fast",
    description:
      "A clean, intuitive experience makes it easy to explore a pair, make your choice, and continue.",
  },
  {
    icon: Trophy,
    title: "Community Rankings",
    description:
      "Explore the leaderboard to discover popular choices and see how community preferences evolve.",
  },
];

const steps = [
  {
    number: "01",
    title: "Explore the Pair",
    description:
      "View the two options presented on your screen and take a moment to consider them.",
  },
  {
    number: "02",
    title: "Make Your Choice",
    description:
      "Select the option you prefer. Your participation helps shape the community results.",
  },
  {
    number: "03",
    title: "Discover Rankings",
    description:
      "Visit the leaderboard to explore the rankings and see which options are popular.",
  },
];

export default function AboutPage() {
  return (
     <div>
        <SiteHeader />
    <main className="min-h-screen overflow-hidden bg-[#FCFAFD] text-[#21172A]">
       
      {/* Hero */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-80 w-[700px] max-w-full -translate-x-1/2 rounded-full bg-purple-200/30 blur-[100px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-[#762487] shadow-sm">
            <Sparkles size={16} />
            GET TO KNOW US
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Every Vote Has a{" "}
            <span className="bg-gradient-to-r from-[#702080] via-[#9B36C5] to-[#C084FC] bg-clip-text text-transparent">
              Voice.
            </span>
            <br className="hidden sm:block" /> Every Choice Matters.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#716779] sm:text-lg">
            We are building a more engaging way for people to share their
            preferences, discover community favorites, and make every choice
            count.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#702080] to-[#9635B5] px-7 py-3.5 font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Voting
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-7 py-3.5 font-semibold text-[#702080] shadow-sm transition hover:border-purple-400 hover:bg-purple-50"
            >
              <Trophy size={18} />
              View Leaderboard
            </Link>
          </div>

          {/* Values strip */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Heart, label: "Community Driven" },
              { icon: Vote, label: "Your Choice Matters" },
              { icon: ShieldCheck, label: "Responsible Participation" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-purple-100 bg-white/80 px-4 py-4 text-sm font-medium text-[#55465F] shadow-sm"
                >
                  <Icon size={19} className="shrink-0 text-[#85289A]" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About and mission */}
      <section className="border-y border-purple-100 bg-white px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B2AA0]">
              WHO WE ARE
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              More Than a Vote.
              <span className="mt-1 block text-[#812991]">
                It&apos;s About Connection.
              </span>
            </h2>

            <p className="mt-6 leading-8 text-[#716779]">
              Superior Connection is a community voting platform designed to
              make expressing preferences simple and engaging. Through
              head-to-head comparisons, everyone gets an opportunity to
              participate and contribute to a shared experience.
            </p>

            <p className="mt-4 leading-8 text-[#716779]">
              Whether you are exploring the latest pairs or checking the
              leaderboard, our goal is to create an inviting space where
              people can make choices, discover trends, and connect through
              participation.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "An easy-to-use voting experience",
                "A clear and accessible interface",
                "A community-focused leaderboard",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-[#8B2AA0]"
                  />
                  <span className="text-sm font-medium text-[#55465F] sm:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission card */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-purple-200/60 via-fuchsia-100/50 to-purple-100/30 blur-xl" />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-purple-100 bg-gradient-to-br from-white via-[#FDF9FF] to-[#F5E8FC] p-7 shadow-xl shadow-purple-100/40 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#702080] to-[#A43AD0] text-white shadow-lg shadow-purple-200">
                <Target size={28} />
              </div>

              <span className="mt-8 block text-sm font-bold uppercase tracking-[0.18em] text-[#8B2AA0]">
                OUR MISSION
              </span>

              <h3 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
                Making every opinion part of a bigger picture.
              </h3>

              <p className="mt-4 leading-7 text-[#716779]">
                We want to make community participation approachable, enjoyable,
                and meaningful through simple choices and an easy-to-explore
                voting experience.
              </p>

              <div className="mt-8 flex items-center gap-3 border-t border-purple-200/70 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#85289A] shadow-sm">
                  <Eye size={21} />
                </div>
                <div>
                  <p className="font-semibold text-[#34233D]">
                    Our Vision
                  </p>
                  <p className="mt-1 text-sm text-[#716779]">
                    A connected community where every voice has a place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B2AA0]">
              WHY SUPERIOR CONNECTION
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Designed Around Your Experience
            </h2>
            <p className="mt-4 leading-7 text-[#716779]">
              Everything is designed to help you participate with ease and
              explore the community&apos;s choices.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#85289A] transition group-hover:bg-[#85289A] group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#716779]">
                    {feature.description}
                  </p>

                  <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-[#702080] to-[#C084FC] transition-all group-hover:w-16" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-purple-100 bg-white px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B2AA0]">
              HOW IT WORKS
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Three Steps. One Simple Experience.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#716779]">
              Getting involved is easy. Follow these simple steps and become
              part of the voting community.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-purple-100 bg-[#FCF9FE] p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold tracking-tight text-purple-200">
                    {step.number}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight
                      className="hidden text-purple-300 md:block"
                      size={22}
                    />
                  )}
                </div>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#716779]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#651875] via-[#802694] to-[#A43AC0] px-6 py-12 text-center shadow-xl shadow-purple-200/50 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-12 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <Heart size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
              Your Choice. Your Voice. Your Community.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-purple-100">
              Ready to participate? Explore the current voting pairs and let
              your preferences be part of the experience.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#702080] shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              Start Voting Today
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom note */}
      <footer className="border-t border-purple-100 bg-white px-5 py-6 text-center">
        <p className="text-sm text-[#817589]">
          Superior Connection · Bringing people together, one choice at a time.
        </p>
      </footer>

      <Footer />
    </main>
     </div>
  );
}
