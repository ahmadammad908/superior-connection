"use client";

import { useCallback, useEffect, useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import {
  MessageCircle,
  Send,
  Loader2,
  LogIn,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type CommentItem = {
  _id: string;
  body: string;
  authorName?: string;
  authorImage?: string;
  createdAt?: string;
  parentId?: string | null;
  replyToName?: string;
  replies?: CommentItem[];
};

type ReplyTarget = { rootId: string; targetId: string; name: string };

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

function displayName(c: CommentItem) {
  return c.authorName?.trim() || "Anonymous";
}

/* ---------- small pieces ---------- */

function Avatar({
  name,
  image,
  small = false,
}: {
  name: string;
  image?: string;
  small?: boolean;
}) {
  const size = small ? "h-7 w-7" : "h-8 w-8";
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className={`${size} rounded-full object-cover`} />
    );
  }
  return (
    <span
      className={`flex ${size} items-center justify-center rounded-full bg-[#6C1C74] text-xs font-bold text-white`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function CommentHeader({
  c,
  small = false,
}: {
  c: CommentItem;
  small?: boolean;
}) {
  const name = displayName(c);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={name} image={c.authorImage} small={small} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</p>
      </div>
    </div>
  );
}

function ReplyButton({
  isSignedIn,
  onClick,
}: {
  isSignedIn: boolean;
  onClick: () => void;
}) {
  const cls =
    "inline-flex items-center gap-1 text-xs font-semibold text-[#6C1C74] hover:underline";

  // Signed-out users get the sign-in modal instead of a reply box
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button type="button" className={cls}>
          <Reply className="h-3.5 w-3.5" />
          Reply
        </button>
      </SignInButton>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <Reply className="h-3.5 w-3.5" />
      Reply
    </button>
  );
}

function ReplyForm({
  placeholder,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  // returns an error message, or null on success
  onSubmit: (body: string) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || posting) return;

    setPosting(true);
    setError("");
    const err = await onSubmit(body);
    if (err) {
      setError(err);
      setPosting(false);
    }
    // on success the parent closes this form
  }

  return (
    <form onSubmit={handle} className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={300}
        rows={2}
        autoFocus
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-purple-100 bg-white p-2.5 text-base text-gray-900 shadow-sm sm:text-sm outline-none transition focus:border-[#6C1C74] focus:ring-2 focus:ring-[#6C1C74]/20"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">{text.length}/300</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
          >
            {posting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Reply
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </form>
  );
}

/* ---------- main component ---------- */

export function WebsiteComments() {
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = !!isSignedIn;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async (before?: string | null) => {
    try {
      const qs = before ? `?before=${encodeURIComponent(before)}` : "";
      const res = await fetch(`/api/comments${qs}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const incoming: CommentItem[] = Array.isArray(data.comments)
        ? data.comments
        : [];
      setComments((prev) => (before ? [...prev, ...incoming] : incoming));
      setNextBefore(data.nextBefore ?? null);
    } catch {
      // network error: keep whatever is already on screen
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || posting) return;

    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.comment) {
        setError(data.error || "Could not post your comment.");
        return;
      }
      setComments((prev) => [{ ...data.comment, replies: [] }, ...prev]);
      setText("");
    } catch {
      setError("No internet connection. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  // Posts a reply. Returns an error message, or null on success.
  async function postReply(
    rootId: string,
    targetId: string,
    body: string
  ): Promise<string | null> {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentId: targetId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.comment) {
        return data.error || "Could not post your reply.";
      }

      setComments((prev) =>
        prev.map((c) =>
          c._id === rootId
            ? { ...c, replies: [...(c.replies ?? []), data.comment] }
            : c
        )
      );
      setExpanded((prev) => ({ ...prev, [rootId]: true }));
      setReplyingTo(null);
      return null;
    } catch {
      return "No internet connection. Please try again.";
    }
  }

  async function loadMore() {
    if (!nextBefore) return;
    setLoadingMore(true);
    await load(nextBefore);
    setLoadingMore(false);
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-xl px-3 pb-10 sm:mt-16 sm:px-0">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
        <MessageCircle className="h-5 w-5 text-[#6C1C74]" />
        Comments & Reviews
      </h3>
      <p className="mb-4 text-xs text-gray-500 sm:text-sm">
        Share your thoughts about the website. Everyone can read them.
      </p>

      {isLoaded && isSignedIn ? (
        <form onSubmit={submit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Write your comment or review..."
            className="w-full resize-none rounded-2xl border border-purple-100 bg-white p-3 text-base text-gray-900 shadow-sm sm:text-sm outline-none transition focus:border-[#6C1C74] focus:ring-2 focus:ring-[#6C1C74]/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/300</span>
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-200 transition hover:opacity-95 disabled:opacity-50 sm:text-sm"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
          )}
        </form>
      ) : isLoaded ? (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[#6C1C74]">
            <LogIn className="h-4 w-4" />
            Sign in to write a comment.
          </p>
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full border border-[#6C1C74]/30 bg-white px-4 py-1.5 text-xs font-semibold text-[#6C1C74] transition hover:bg-purple-50"
              >
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#6C1C74]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">
          No comments yet. Be the first!
        </p>
      ) : (
        <div>
          <ul className="space-y-3">
            {comments.map((c) => {
              const replies = c.replies ?? [];
              const isOpen = !!expanded[c._id];

              return (
                <li
                  key={c._id}
                  className="rounded-2xl border border-purple-100 bg-white p-3 shadow-sm"
                >
                  <CommentHeader c={c} />
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {c.body}
                  </p>

                  <div className="mt-2 flex items-center gap-4">
                    <ReplyButton
                      isSignedIn={signedIn}
                      onClick={() =>
                        setReplyingTo(
                          replyingTo?.targetId === c._id
                            ? null
                            : {
                                rootId: c._id,
                                targetId: c._id,
                                name: displayName(c),
                              }
                        )
                      }
                    />

                    {replies.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [c._id]: !isOpen }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#6C1C74]"
                      >
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                        {isOpen
                          ? "Hide replies"
                          : `View ${replies.length} ${
                              replies.length === 1 ? "reply" : "replies"
                            }`}
                      </button>
                    )}
                  </div>

                  {replyingTo?.targetId === c._id && (
                    <ReplyForm
                      placeholder={`Reply to ${replyingTo.name}...`}
                      onSubmit={(body) => postReply(c._id, c._id, body)}
                      onCancel={() => setReplyingTo(null)}
                    />
                  )}

                  {isOpen && replies.length > 0 && (
                    <ul className="mt-3 space-y-3 border-l-2 border-purple-100 pl-3">
                      {replies.map((r) => (
                        <li key={r._id}>
                          <CommentHeader c={r} small />
                          {r.replyToName && (
                            <p className="mt-1 text-[11px] font-medium text-[#6C1C74]">
                              Replying to @{r.replyToName}
                            </p>
                          )}
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                            {r.body}
                          </p>

                          <div className="mt-1.5">
                            <ReplyButton
                              isSignedIn={signedIn}
                              onClick={() =>
                                setReplyingTo(
                                  replyingTo?.targetId === r._id
                                    ? null
                                    : {
                                        rootId: c._id,
                                        targetId: r._id,
                                        name: displayName(r),
                                      }
                                )
                              }
                            />
                          </div>

                          {replyingTo?.targetId === r._id && (
                            <ReplyForm
                              placeholder={`Reply to ${replyingTo.name}...`}
                              onSubmit={(body) => postReply(c._id, r._id, body)}
                              onCancel={() => setReplyingTo(null)}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {nextBefore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-[#6C1C74]/30 bg-white px-5 py-2 text-xs font-semibold text-[#6C1C74] transition hover:bg-purple-50 disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              Load more
            </button>
          )}
        </div>
      )}
    </section>
  );
}