"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/super6.png";

const INSTAGRAM_ID = "superior78667";
const INSTAGRAM_URL =
  "https://www.instagram.com/superior78667?exln=aG53YzYwd2hyY3l3&utm_source=qr";

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

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 text-center text-sm leading-relaxed text-[#4B5563] lg:space-y-2 lg:py-3">
          <p>
            Thank you for being part of this journey! The voting is now{" "}
            <strong className="text-[#6C1C74]">finished</strong>. It was just a{" "}
            <strong>fun and friendly activity</strong> among university students.
          </p>
          <p>
            Every girl featured here is{" "}
            <strong className="text-[#6C1C74]">special and valued</strong>. A vote count
            never defines anyone&apos;s worth, beauty, or talent.
          </p>
          <p>
            Get ready for a <strong className="text-[#6C1C74]">new adventure</strong>{" "}
            coming soon. Please wait a little, and always remember:{" "}
            <strong className="text-[#6C1C74]">Superior Connection</strong> will give you
            a full, safe adventure.
          </p>
          <p>
            Have a question, a query, an idea, or even a confession? Feel free to
            message us on Instagram{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#6C1C74] underline"
            >
              @{INSTAGRAM_ID}
            </a>
            . We&apos;d love to hear from you.
          </p>
        </div>

        <div className="shrink-0 px-6 pb-5 pt-2">
          <button
            onClick={close}
            className="w-full rounded-xl bg-[#6C1C74] py-3 text-sm font-semibold text-white transition hover:bg-[#561659] focus:outline-none focus:ring-2 focus:ring-[#6C1C74]/40"
          >
            Got it, I&apos;ll wait
          </button>
        </div>
      </div>
    </div>
  );
}