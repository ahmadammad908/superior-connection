"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function BanNoticeBanner() {
  const [banInfo, setBanInfo] = useState<{
    isBanned: boolean;
    banReason?: string;
    bannedUntil?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.isBanned) {
          setBanInfo({
            isBanned: true,
            banReason: data.user.banReason,
            bannedUntil: data.user.bannedUntil,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!banInfo || !banInfo.isBanned) return null;

  return (
    <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">
            Account Status:{" "}
            {banInfo.bannedUntil
              ? `Suspended until ${new Date(banInfo.bannedUntil).toLocaleDateString()}`
              : "Permanently Banned"}
          </p>
          <p className="mt-1 text-red-700">
            Reason: {banInfo.banReason || "Violation of campus community guidelines."}
          </p>
          <p className="mt-1 text-[11px] text-red-600">
            While your account is suspended or banned, you cannot create posts, leave comments, or like content.
          </p>
        </div>
      </div>
    </div>
  );
}
