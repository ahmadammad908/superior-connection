"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Send,
  Loader2,
  Heart,
  Reply,
  Trash2,
  Edit3,
  Flag,
  CornerDownRight,
  X,
  MessageSquare,
} from "lucide-react";
import { ReportModal } from "./ReportModal";

export type CommentItem = {
  _id: string;
  postId: string;
  authorId: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    department?: string;
    semester?: string;
    role?: string;
  };
  body: string;
  parentId?: string | null;
  replyToName?: string;
  likesCount: number;
  isLiked: boolean;
  isAuthor: boolean;
  canDelete: boolean;
  replies?: CommentItem[];
  createdAt: string;
};

interface CommentSectionProps {
  postId: string;
}

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

export function CommentSection({ postId }: CommentSectionProps) {
  const { isSignedIn, user } = useUser();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    rootId: string;
    name: string;
  } | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          body: newCommentText.trim(),
          parentId: replyTarget?.rootId || null,
          replyToName: replyTarget?.name || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: CommentItem = data.comment;

        if (created.parentId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === created.parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), created],
                };
              }
              return c;
            })
          );
        } else {
          setComments((prev) => [...prev, created]);
        }

        setNewCommentText("");
        setReplyTarget(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string, parentId?: string | null) => {
    if (!isSignedIn) return;

    // Optimistic toggle
    setComments((prev) =>
      prev.map((root) => {
        if (!parentId && root._id === commentId) {
          const nextLiked = !root.isLiked;
          return {
            ...root,
            isLiked: nextLiked,
            likesCount: nextLiked ? root.likesCount + 1 : Math.max(0, root.likesCount - 1),
          };
        }
        if (parentId && root._id === parentId) {
          return {
            ...root,
            replies: (root.replies || []).map((reply) => {
              if (reply._id === commentId) {
                const nextLiked = !reply.isLiked;
                return {
                  ...reply,
                  isLiked: nextLiked,
                  likesCount: nextLiked ? reply.likesCount + 1 : Math.max(0, reply.likesCount - 1),
                };
              }
              return reply;
            }),
          };
        }
        return root;
      })
    );

    try {
      await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string, parentId?: string | null) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        if (!parentId) {
          setComments((prev) => prev.filter((c) => c._id !== commentId));
        } else {
          setComments((prev) =>
            prev.map((root) => {
              if (root._id === parentId) {
                return {
                  ...root,
                  replies: (root.replies || []).filter((r) => r._id !== commentId),
                };
              }
              return root;
            })
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string, parentId?: string | null) => {
    if (!editBody.trim()) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody.trim() }),
      });

      if (res.ok) {
        if (!parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c._id === commentId ? { ...c, body: editBody.trim() } : c
            )
          );
        } else {
          setComments((prev) =>
            prev.map((root) => {
              if (root._id === parentId) {
                return {
                  ...root,
                  replies: (root.replies || []).map((r) =>
                    r._id === commentId ? { ...r, body: editBody.trim() } : r
                  ),
                };
              }
              return root;
            })
          );
        }
        setEditingCommentId(null);
        setEditBody("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#6C1C74]/10 pb-4">
        <MessageSquare className="h-5 w-5 text-[#6C1C74]" />
        <h3 className="text-base font-bold text-gray-900">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Add comment box */}
      <div className="mt-4">
        {isSignedIn ? (
          <form onSubmit={handlePostComment} className="space-y-2">
            {replyTarget && (
              <div className="flex items-center justify-between rounded-xl bg-[#6C1C74]/5 px-3 py-1.5 text-xs text-[#6C1C74]">
                <span>
                  Replying to <strong>{replyTarget.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="rounded p-0.5 hover:bg-[#6C1C74]/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#6C1C74]/10">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-xs font-bold text-white">
                    {user?.firstName?.charAt(0) || "S"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    replyTarget
                      ? `Write a reply to ${replyTarget.name}...`
                      : "Add your voice or opinion to this discussion..."
                  }
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>{replyTarget ? "Reply" : "Comment"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-dashed border-[#6C1C74]/20 p-4 text-center">
            <p className="text-xs text-gray-600">
              Sign in to participate in the conversation.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="mt-2 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
              >
                Sign In to Comment
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="space-y-3">
              {/* Root Comment */}
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#6C1C74]/10">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-xs font-bold text-white">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          · {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {comment.isAuthor && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditBody(comment.body);
                            }}
                            className="p-1 text-gray-400 hover:text-[#6C1C74]"
                            title="Edit comment"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        )}
                        {comment.canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id, null)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete comment"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setReportCommentId(comment._id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Report comment"
                        >
                          <Flag className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {editingCommentId === comment._id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 p-2 text-xs text-gray-900"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="rounded px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(comment._id, null)}
                            className="rounded bg-[#6C1C74] px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {comment.body}
                      </p>
                    )}
                  </div>

                  {/* Comment actions row */}
                  <div className="mt-1 flex items-center gap-3 pl-2 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment._id, null)}
                      className={`inline-flex items-center gap-1 font-semibold hover:text-[#6C1C74] ${
                        comment.isLiked ? "text-[#6C1C74]" : ""
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          comment.isLiked ? "fill-[#6C1C74] text-[#6C1C74]" : ""
                        }`}
                      />
                      <span>{comment.likesCount || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyTarget({
                          rootId: comment._id,
                          name: comment.author.name,
                        })
                      }
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#6C1C74]"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* 1-Level Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-2.5 pl-4 sm:pl-6 border-l-2 border-[#6C1C74]/20">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex items-start gap-2">
                          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#6C1C74]/10">
                            {reply.author.avatar ? (
                              <img
                                src={reply.author.avatar}
                                alt={reply.author.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-[10px] font-bold text-white">
                                {reply.author.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="rounded-xl bg-purple-50/30 p-2.5 border border-purple-100/50">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-gray-900">
                                    {reply.author.name}
                                  </span>
                                  {reply.replyToName && (
                                    <span className="text-[10px] text-[#6C1C74]">
                                      replying to @{reply.replyToName}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">
                                    · {timeAgo(reply.createdAt)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {reply.isAuthor && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(reply._id);
                                        setEditBody(reply.body);
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-[#6C1C74]"
                                    >
                                      <Edit3 className="h-2.5 w-2.5" />
                                    </button>
                                  )}
                                  {reply.canDelete && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteComment(reply._id, comment._id)
                                      }
                                      className="p-0.5 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setReportCommentId(reply._id)}
                                    className="p-0.5 text-gray-400 hover:text-gray-600"
                                  >
                                    <Flag className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>

                              {editingCommentId === reply._id ? (
                                <div className="mt-2 space-y-1.5">
                                  <textarea
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-gray-300 p-1.5 text-xs text-gray-900"
                                  />
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCommentId(null)}
                                      className="rounded px-2 py-0.5 text-[10px] text-gray-600 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveEdit(reply._id, comment._id)
                                      }
                                      className="rounded bg-[#6C1C74] px-2 py-0.5 text-[10px] font-semibold text-white"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-1 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                                  {reply.body}
                                </p>
                              )}
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 pl-2 text-[11px] text-gray-500">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLikeComment(reply._id, comment._id)
                                }
                                className={`inline-flex items-center gap-1 font-semibold hover:text-[#6C1C74] ${
                                  reply.isLiked ? "text-[#6C1C74]" : ""
                                }`}
                              >
                                <Heart
                                  className={`h-2.5 w-2.5 ${
                                    reply.isLiked
                                      ? "fill-[#6C1C74] text-[#6C1C74]"
                                      : ""
                                  }`}
                                />
                                <span>{reply.likesCount || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {reportCommentId && (
        <ReportModal
          isOpen={Boolean(reportCommentId)}
          onClose={() => setReportCommentId(null)}
          targetType="comment"
          targetId={reportCommentId}
        />
      )}
    </section>
  );
}
export default CommentSection;
