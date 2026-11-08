"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/super6.png";
import Countdown from "./Countdown";

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

        <div className="shrink-0 px-6">
          <Countdown />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 text-center text-sm leading-relaxed text-[#4B5563] lg:space-y-2 lg:py-3">
          <p>
            Welcome! This is a{" "}
            <strong className="text-[#6C1C74]">friendly appreciation</strong>{" "}
            of some of our teachers. You have only{" "}
            <strong className="text-[#6C1C74]">24 hours left</strong> to cast a
            vote and say thank you to the teacher who inspired you.
          </p>
          <p>
            Every teacher is{" "}
            <strong className="text-[#6C1C74]">special and valued</strong>. A
            vote count never defines a teacher&apos;s worth, hard work, or
            dedication, and teachers who are not listed here are just as
            respected.
          </p>
          <p>
            Have a question, a query, an idea, or some feedback? Please leave a{" "}
            <strong className="text-[#6C1C74]">comment on this website</strong>{" "}
            in the comment section below. We&apos;d love to hear from you.
          </p>
        </div>

        <div className="shrink-0 px-6 pb-5 pt-2">
          <button
            onClick={close}
            className="w-full rounded-xl bg-[#6C1C74] py-3 text-sm font-semibold text-white transition hover:bg-[#561659] focus:outline-none focus:ring-2 focus:ring-[#6C1C74]/40"
          >
            Let&apos;s vote 💜
          </button>
        </div>
      </div>
    </div>
  );
}