"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/super6.png";
import Countdown from "./Countdown"; // apna sahi path likhein

const COMMENTS_ID = "comments";

export default function WelcomePopup() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const goToComments = () => {
    setOpen(false);
    // Popup band hone ke baad body scroll wapas enable hota hai, phir scroll karein
    setTimeout(() => {
      const el = document.getElementById(COMMENTS_ID);
      if (el) {
        const offset = 96; // zyada scroll ho to number barhayein, kam ho to ghatayein
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 100);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      onClick={close}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col items-center px-6 py-4 text-center lg:py-3">
          <div className="mb-2 flex items-center justify-center rounded-full p-1">
            <Image
              src={logo}
              alt="Superior logo"
              className="h-16 w-16 object-contain lg:h-14 lg:w-14"
              priority
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-black/80">
            A message from
          </p>
          <h2
            id="welcome-popup-title"
            className="text-xl font-bold text-black"
          >
            Superior Connection
          </h2>
        </div>

        {/* Countdown (message se pehle) */}
        <div className="shrink-0 px-6">
          <Countdown />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 text-center text-sm leading-relaxed text-[#4B5563] lg:space-y-2 lg:py-3">
          <p>
            The wait is over!{" "}
            <strong className="text-[#6C1C74]">Boys&apos; Voting is now LIVE!</strong>{" "}
            It&apos;s your chance to participate, cast your vote, and support
            your favorite candidates.
          </p>

          <p>
            Explore the profiles, make your choice, and let your{" "}
            <strong className="text-[#6C1C74]">voice be heard</strong>. Every
            vote makes this experience more exciting!
          </p>

          <p>
            A big thank you to everyone who participated in the{" "}
            <strong className="text-[#6C1C74]">Teachers&apos; Voting</strong>.
            Your support and appreciation mean a lot to us.
          </p>

          <p>
            Remember, this is all about fun, participation, and celebrating our
            university community. Respect everyone and enjoy the experience!
          </p>

          <p>
            Have a question, idea, or feedback? Click below and{" "}
            <strong className="text-[#6C1C74]">leave us a comment</strong>.
            We&apos;d love to hear from you!
          </p>
        </div>

        <div className="shrink-0 space-y-2 px-6 pb-5 pt-2">
          <button
            onClick={goToComments}
            className="w-full rounded-xl bg-[#6C1C74] py-3 text-sm font-semibold text-white transition hover:bg-[#561659] focus:outline-none focus:ring-2 focus:ring-[#6C1C74]/40"
          >
            Leave a comment 💬
          </button>
          <button
            onClick={close}
            className="w-full rounded-xl border border-[#6C1C74]/30 bg-white py-3 text-sm font-semibold text-[#6C1C74] transition hover:bg-[#6C1C74]/5 focus:outline-none focus:ring-2 focus:ring-[#6C1C74]/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}