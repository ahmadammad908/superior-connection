
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Eye,
  Database,
  Cookie,
  UserCheck,
  Mail,
  FileText,
  Globe,
  Bell,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
const sections = [
  { id: "introduction", title: "Introduction", icon: FileText },
  { id: "information", title: "Information We Collect", icon: Database },
  { id: "usage", title: "How We Use Your Information", icon: Eye },
  { id: "voting", title: "Voting & Preferences", icon: UserCheck },
  { id: "cookies", title: "Cookies & Technologies", icon: Cookie },
  { id: "sharing", title: "Information Sharing", icon: Globe },
  { id: "security", title: "Data Security", icon: LockKeyhole },
  { id: "rights", title: "Your Privacy Rights", icon: ShieldCheck },
  { id: "children", title: "Children's Privacy", icon: Bell },
  { id: "changes", title: "Policy Updates", icon: CalendarDays },
  { id: "contact", title: "Contact Us", icon: Mail },
];

function SectionHeading({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-purple-100 py-8 last:border-0 sm:py-10"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-[#812991]">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-[#2C2034] sm:text-2xl">
            {title}
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[#716779] sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
   <>
    <SiteHeader />
    <main className="min-h-screen overflow-hidden bg-[#FCFAFD] text-[#21172A]">
         
      {/* Hero */}
      <section className="relative px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[700px] max-w-full -translate-x-1/2 rounded-full bg-purple-200/30 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[#702080] shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#702080] to-[#A43AD0] text-white shadow-lg shadow-purple-200">
            <ShieldCheck size={32} strokeWidth={1.8} />
          </div>

          <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#812991]">
            <LockKeyhole size={14} />
            Your Privacy Matters
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Privacy{" "}
            <span className="bg-gradient-to-r from-[#702080] via-[#9B36C5] to-[#C084FC] bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#716779] sm:text-lg">
            Your trust matters to us. Learn how Superior Connection handles
            information when you visit our platform, participate in voting,
            and explore community rankings.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-sm text-[#716779] shadow-sm">
            <CalendarDays size={16} className="text-[#812991]" />
            Effective date: October 26, 2026
          </div>
        </div>
      </section>

      {/* Privacy highlights */}
      <section className="px-5 pb-14 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Transparency",
              text: "Understand what information may be collected and why.",
            },
            {
              icon: LockKeyhole,
              title: "Data Protection",
              text: "We aim to protect information using appropriate safeguards.",
            },
            {
              icon: UserCheck,
              title: "Your Choices",
              text: "Learn about the privacy choices available to you.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#812991]">
                  <Icon size={22} />
                </div>
                <h2 className="mt-4 font-bold text-[#2C2034]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#716779]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Policy content */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Table of contents */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#2C2034]">
                On This Page
              </h2>
              <p className="mt-1 text-sm text-[#817589]">
                Browse our privacy policy
              </p>

              <nav className="mt-5 space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#716779] transition hover:bg-purple-50 hover:text-[#702080]"
                    >
                      <Icon
                        size={17}
                        className="shrink-0 text-[#9B71A6] group-hover:text-[#812991]"
                      />
                      <span className="flex-1">{section.title}</span>
                      <ChevronRight
                        size={15}
                        className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </a>
                  );
                })}
              </nav>

              <div className="mt-5 rounded-xl bg-gradient-to-br from-[#F7ECFC] to-[#FCF8FE] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#702080]">
                  <Mail size={17} />
                  Have a question?
                </div>
                <p className="mt-2 text-xs leading-5 text-[#716779]">
                  Contact our team for privacy-related questions or requests.
                </p>
                <a
                  href="#contact"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#812991] hover:underline"
                >
                  Get in touch <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </aside>

          {/* Main document */}
          <article className="min-w-0 rounded-2xl border border-purple-100 bg-white px-5 shadow-sm sm:px-8 lg:px-10">
            <div className="flex items-start gap-4 border-b border-purple-100 py-7 sm:py-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#812991]">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2C2034]">
                  Our Commitment to Privacy
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#716779]">
                  This policy explains our intended approach to information
                  handling. The actual practices depend on the features,
                  services, and technologies used by the platform.
                </p>
              </div>
            </div>

            <SectionHeading
              id="introduction"
              number="01"
              title="Introduction"
            >
              <p>
                Welcome to Superior Connection. We value your privacy and
                believe you should understand how information is handled when
                you use our website and voting features.
              </p>
              <p>
                This Privacy Policy describes the categories of information
                that may be collected, how it may be used, when it may be
                shared, and the choices that may be available to you.
              </p>
              <p>
                By using the platform, you acknowledge that you have had the
                opportunity to read this policy. Where consent is legally
                required, we will seek it separately as appropriate.
              </p>
            </SectionHeading>

            <SectionHeading
              id="information"
              number="02"
              title="Information We Collect"
            >
              <p>
                Depending on how the platform is configured and which features
                you use, the following categories of information may be
                processed:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#9B36C5]">
                <li>
                  <strong className="text-[#493650]">
                    Account information:
                  </strong>{" "}
                  Information such as your name, email address, profile image,
                  or account identifier if account registration is supported.
                </li>
                <li>
                  <strong className="text-[#493650]">
                    Voting information:
                  </strong>{" "}
                  Your selections, participation records, and related
                  information needed to operate voting features.
                </li>
                <li>
                  <strong className="text-[#493650]">
                    Technical information:
                  </strong>{" "}
                  Information such as browser type, device details, IP address,
                  and server logs where collected.
                </li>
                <li>
                  <strong className="text-[#493650]">
                    Usage information:
                  </strong>{" "}
                  Interactions with pages, features, and navigation, where
                  analytics or logging tools are enabled.
                </li>
                <li>
                  <strong className="text-[#493650]">
                    Communications:
                  </strong>{" "}
                  Information you provide when you contact us for assistance
                  or submit a privacy request.
                </li>
              </ul>
              <p>
                We aim to collect only information that is reasonably
                necessary for the relevant purpose. The categories listed
                above are possibilities, not a statement that every category
                is currently collected.
              </p>
            </SectionHeading>

            <SectionHeading
              id="usage"
              number="03"
              title="How We Use Your Information"
            >
              <p>
                Information may be used for legitimate platform purposes,
                including:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#9B36C5]">
                <li>Operating and maintaining the website and its features.</li>
                <li>Recording votes and calculating rankings where enabled.</li>
                <li>Maintaining platform security and preventing abuse.</li>
                <li>Diagnosing errors and improving usability and performance.</li>
                <li>Responding to questions and support requests.</li>
                <li>Meeting applicable legal obligations.</li>
              </ul>
              <p>
                We do not describe these possible uses as proof that every
                activity is currently performed. Our actual processing should
                reflect the features and services in operation.
              </p>
            </SectionHeading>

            <SectionHeading
              id="voting"
              number="04"
              title="Voting & Preferences"
            >
              <p>
                Superior Connection provides a voting experience in which
                users may compare available options and choose their
                preferences. Where supported, selections may be stored to
                manage participation, prevent duplicate voting, or calculate
                results.
              </p>
              <p>
                Votes and associated records may be processed to display
                aggregate rankings or other results. If individual voting
                records are stored, access should be limited to authorized
                purposes and personnel.
              </p>
              <p>
                Do not submit sensitive personal information as part of a
                vote or profile unless a feature explicitly requests it and
                you understand why it is needed.
              </p>
              <p>
                The visibility of votes, profile details, and voting history
                depends on the platform's actual configuration. We recommend
                checking the relevant interface before assuming a selection
                is private or publicly identifiable.
              </p>
            </SectionHeading>

            <SectionHeading
              id="cookies"
              number="05"
              title="Cookies & Similar Technologies"
            >
              <p>
                The website may use cookies or similar technologies if they
                are enabled. These technologies can support essential
                functionality, session management, security, and preferences.
                Analytics or advertising cookies may also be used if those
                services are implemented.
              </p>
              <p>
                Where required by law, we will request consent before using
                non-essential cookies. Depending on your browser and
                applicable law, you may be able to block or delete cookies.
                Some features may not function properly if essential cookies
                are disabled.
              </p>
              <p>
                The actual cookies in use should be documented based on the
                website's deployed services and configuration.
              </p>
            </SectionHeading>

            <SectionHeading
              id="sharing"
              number="06"
              title="Information Sharing"
            >
              <p>
                We do not intend to sell personal information as part of the
                ordinary operation of this voting platform. Information may
                be disclosed in limited circumstances, such as:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#9B36C5]">
                <li>
                  Service providers that help host, maintain, or secure the
                  website and its database.
                </li>
                <li>
                  Providers of authentication, storage, or analytics services
                  where those tools are actually used.
                </li>
                <li>
                  Authorities or other parties when disclosure is required by
                  applicable law or a valid legal process.
                </li>
                <li>
                  Relevant parties in connection with a business transfer,
                  where lawful and appropriately safeguarded.
                </li>
              </ul>
              <p>
                Service providers should process personal information only
                under appropriate terms and for authorized purposes.
                Information may also be visible to other users if a feature
                intentionally displays it, such as a public leaderboard.
              </p>
            </SectionHeading>

            <SectionHeading
              id="security"
              number="07"
              title="Data Security & Retention"
            >
              <p>
                We aim to use reasonable technical and organizational
                safeguards to protect information against unauthorized access,
                alteration, disclosure, and loss.
              </p>
              <p>
                Depending on the implementation, safeguards may include
                access controls, secure connections, appropriate permissions,
                and monitoring for suspicious activity. No website or
                electronic storage method can be guaranteed completely secure.
              </p>
              <p>
                Information should be retained only for as long as reasonably
                necessary for its stated purpose, legitimate operational
                requirements, dispute resolution, or legal obligations.
                Retention periods depend on the type of information and
                applicable requirements.
              </p>
            </SectionHeading>

            <SectionHeading
              id="rights"
              number="08"
              title="Your Privacy Rights & Choices"
            >
              <p>
                Depending on your location and applicable law, you may have
                rights to:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#9B36C5]">
                <li>Request access to personal information we hold about you.</li>
                <li>Ask us to correct inaccurate information.</li>
                <li>Request deletion of information where legally available.</li>
                <li>Object to or request restriction of certain processing.</li>
                <li>Withdraw consent where processing relies on consent.</li>
                <li>Request a copy of eligible information in a portable format.</li>
              </ul>
              <p>
                These rights are subject to applicable legal conditions and
                exceptions. To submit a request, contact us using the details
                provided below. We may need to verify your identity before
                responding.
              </p>
              <p>
                You may also have the right to complain to the relevant data
                protection authority in your jurisdiction.
              </p>
            </SectionHeading>

            <SectionHeading
              id="children"
              number="09"
              title="Children's Privacy"
            >
              <p>
                Our platform is not intended to collect personal information
                from children in violation of applicable law. Where age
                restrictions or parental consent requirements apply, the
                platform should follow those requirements.
              </p>
              <p>
                If you believe a child has provided personal information
                without the required authorization, please contact us so the
                matter can be reviewed and appropriate action can be taken.
              </p>
            </SectionHeading>

            <SectionHeading
              id="changes"
              number="10"
              title="Changes to This Policy"
            >
              <p>
                We may update this Privacy Policy as the platform evolves,
                our practices change, or legal requirements develop.
              </p>
              <p>
                When changes are published, we will update the effective date
                at the top of this page. If a change requires additional
                notice or consent under applicable law, we will take
                appropriate steps.
              </p>
              <p>
                We encourage you to revisit this page periodically to stay
                informed about our privacy practices.
              </p>
            </SectionHeading>

            <SectionHeading
              id="contact"
              number="11"
              title="Contact Us"
            >
              <p>
                If you have a question about this Privacy Policy, wish to
                exercise an applicable privacy right, or have a concern about
                the handling of your information, please contact the team
                responsible for Superior Connection.
              </p>

              <div className="mt-5 rounded-2xl border border-purple-100 bg-gradient-to-br from-[#FCF7FF] to-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#702080] to-[#A43AD0] text-white">
                    <Mail size={23} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#34233D]">
                      Privacy questions?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#716779]">
                      Please use your organization's designated contact email
                      or the official support channel for this website.
                    </p>
                    <p className="mt-3 text-xs text-[#817589]">
                      Configure the actual contact details before publishing
                      this page.
                    </p>
                  </div>
                </div>
              </div>
            </SectionHeading>

            {/* Disclaimer */}
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-xs leading-6 text-amber-900">
                <strong>Before publishing:</strong> This is a general policy
                template, not legal advice. Review it against your actual
                authentication, database, analytics, cookies, hosting, voting
                visibility, retention, and data-sharing practices. Add the
                responsible organization's identity and real contact details.
                Remove statements that do not match your implementation.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#651875] via-[#802694] to-[#A43AC0] px-6 py-12 text-center shadow-xl shadow-purple-200/50 sm:px-12 sm:py-14">
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <ShieldCheck size={28} />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
              Thank You for Being Part of Our Community
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
              We believe a better experience begins with transparency, respect,
              and informed choices.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#702080] transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              Return to Home
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
    </main>
   </>
  );
}
