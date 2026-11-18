"use client";

import React from "react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  title?: string;
}

export function VerifiedBadge({
  size = 15,
  className = "",
  title = "Verified Admin",
}: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      title={title}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-110"
      >
        {/* Instagram / Twitter style verified blue circle / badge */}
        <circle cx="12" cy="12" r="10" fill="#0095F6" />
        {/* Crisp white checkmark */}
        <path
          d="M7.75 12.25L10.5 15L16.25 9.25"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default VerifiedBadge;
