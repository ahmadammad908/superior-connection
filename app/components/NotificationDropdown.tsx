"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, MessageSquare, Heart, ShieldAlert, Pin } from "lucide-react";

type NotificationItem = {
  _id: string;
  actorName: string;
  actorImage?: string;
  type: string;
  postId?: string | null;
  commentId?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Polling every 45s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click / touch
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like_post":
      case "like_comment":
        return <Heart className="h-4 w-4 text-[#6C1C74] fill-[#6C1C74]" />;
      case "comment_post":
      case "reply_comment":
      case "message":
        return <MessageSquare className="h-4 w-4 text-[#6C1C74]" />;
      case "warning":
        return <ShieldAlert className="h-4 w-4 text-[#6C1C74]" />;
      default:
        return <Pin className="h-4 w-4 text-[#6C1C74]" />;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#6C1C74]/20 bg-white text-[#6C1C74] transition hover:bg-[#6C1C74]/5"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6C1C74] px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            fixed inset-x-2 top-[3.75rem] z-[60]
            rounded-2xl border border-[#6C1C74]/15 bg-white p-3 shadow-xl
            animate-in fade-in slide-in-from-top-2 duration-150
            sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96
          "
        >
          <div className="flex items-center justify-between border-b border-[#6C1C74]/10 pb-2 px-1">
            <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-[#6C1C74] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-2 max-h-[65vh] overflow-y-auto overscroll-contain space-y-1 divide-y divide-gray-50 sm:max-h-80">
            {loading && notifications.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#6C1C74]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  href={n.type === "message" ? "/messages" : (n.postId ? `/post/${n.postId}` : "#")}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                    n.read ? "bg-white hover:bg-gray-50" : "bg-[#6C1C74]/5 hover:bg-[#6C1C74]/10"
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-full bg-[#6C1C74]/10 p-1.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs text-gray-900 leading-snug">{n.message}</p>
                    <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6C1C74]" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}