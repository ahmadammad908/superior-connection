"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Pin,
  Megaphone,
  Shield,
  EyeOff,
  Trash2,
  Edit3,
  Flag,
  Check,
  ShieldAlert,
} from "lucide-react";
import { MediaGallery } from "./MediaGallery";
import { ReportModal } from "./ReportModal";
import { EditPostModal } from "./EditPostModal";

export interface PostItem {
  _id: string;
  authorId: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    department?: string;
    semester?: string;
    role?: string;
  };
  realAuthor?: {
    name: string;
    username: string;
    clerkId: string;
  };
  content: string;
  images: string[];
  video?: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isAuthor: boolean;
  createdAt: string;
}

interface PostCardProps {
  post: PostItem;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, updated: Partial<PostItem>) => void;
  isAdmin?: boolean;
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

export function PostCard({
  post,
  onPostDeleted,
  onPostUpdated,
  isAdmin = false,
}: PostCardProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isPinned, setIsPinned] = useState(post.isPinned || false);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic like
  const handleLike = async () => {
    if (!isSignedIn) return;
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
      if (!res.ok) {
        // Rollback
        setIsLiked(!nextLiked);
        setLikesCount(likesCount);
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
    }
  };

  // Optimistic save
  const handleSave = async () => {
    if (!isSignedIn) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await fetch(`/api/posts/${post._id}/save`, { method: "POST" });
      if (!res.ok) {
        setIsSaved(!nextSaved);
      }
    } catch {
      setIsSaved(!nextSaved);
    }
  };

  // Pin / unpin (Admin)
  const handleTogglePin = async () => {
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/posts/${post._id}/pin`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsPinned(data.isPinned);
        onPostUpdated?.(post._id, { isPinned: data.isPinned });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok) {
        onPostDeleted?.(post._id);
      } else {
        alert("Failed to delete post.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Share link
  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const authorLink =
    post.isAnonymous || post.author.username === "anonymous"
      ? null
      : `/profile/${post.author.username}`;

  // Format content with hashtags in purple
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(#[\w\d_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Link
            key={index}
            href={`/?q=${encodeURIComponent(part)}`}
            className="font-semibold text-[#6C1C74] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <article
      className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition ${
        post.isAnnouncement
          ? "border-[#6C1C74] ring-1 ring-[#6C1C74]/20 bg-gradient-to-b from-[#6C1C74]/5 via-white to-white"
          : "border-[#6C1C74]/15 hover:border-[#6C1C74]/30"
      }`}
    >
      {/* Top Banner Badges (Announcement / Pinned) */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {isPinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C1C74] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
            <Pin className="h-3 w-3" />
            Pinned
          </span>
        )}
        {post.isAnnouncement && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#6C1C74] bg-[#6C1C74]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#6C1C74]">
            <Megaphone className="h-3 w-3" />
            Official Announcement
          </span>
        )}
        <span className="rounded-full bg-[#6C1C74]/5 px-2.5 py-0.5 text-[11px] font-medium text-[#6C1C74]">
          {category}
        </span>
      </div>

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#6C1C74]/10">
            {post.isAnonymous ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
                <EyeOff className="h-5 w-5" />
              </div>
            ) : post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-sm font-bold text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {authorLink ? (
                <Link
                  href={authorLink}
                  className="font-bold text-sm text-gray-900 hover:text-[#6C1C74] truncate"
                >
                  {post.author.name}
                </Link>
              ) : (
                <span className="font-bold text-sm text-gray-900 truncate">
                  {post.author.name}
                </span>
              )}

              {post.author.role === "admin" && (
                <span className="inline-flex items-center gap-0.5 text-[#6C1C74]" title="Official Administrator">
                  <Shield className="h-3.5 w-3.5 fill-[#6C1C74]" />
                </span>
              )}

              <span className="text-xs text-gray-400">· {timeAgo(post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
              {!post.isAnonymous && post.author.username && (
                <span>@{post.author.username}</span>
              )}
              {post.author.department && (
                <span>· {post.author.department}</span>
              )}
              {post.author.semester && (
                <span>· {post.author.semester}</span>
              )}
            </div>

            {/* Admin view for anonymous poster */}
            {post.realAuthor && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#6C1C74]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6C1C74]">
                <ShieldAlert className="h-3 w-3" />
                <span>Admin View: Posted by @{post.realAuthor.username} ({post.realAuthor.name})</span>
              </div>
            )}
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl border border-[#6C1C74]/15 bg-white p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleTogglePin}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
                >
                  <Pin className="h-3.5 w-3.5" />
                  <span>{isPinned ? "Unpin post" : "Pin to top"}</span>
                </button>
              )}

              {(post.isAuthor || isAdmin) && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit post</span>
                </button>
              )}

              {(post.isAuthor || isAdmin) && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete post</span>
                </button>
              )}

              {!post.isAuthor && !post.isAnonymous && post.author.username && post.author.username !== "anonymous" && (
                <Link
                  href={`/messages?u=${post.author.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Message author</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setReportModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Report post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Text */}
      <div className="mt-3 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
        {renderFormattedContent(content)}
      </div>

      {/* Media Gallery */}
      <MediaGallery images={post.images} video={post.video} />

      {/* Actions Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#6C1C74]/10 pt-3 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Like Button */}
          {isSignedIn ? (
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isLiked
                  ? "bg-[#6C1C74]/10 text-[#6C1C74]"
                  : "hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  isLiked ? "fill-[#6C1C74] text-[#6C1C74]" : ""
                }`}
              />
              <span className="font-semibold">{likesCount}</span>
            </button>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
              >
                <Heart className="h-4 w-4" />
                <span className="font-semibold">{likesCount}</span>
              </button>
            </SignInButton>
          )}

          {/* Comment Button */}
          <Link
            href={`/post/${post._id}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#6C1C74]/5 hover:text-[#6C1C74] transition"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-semibold">{post.commentsCount || 0}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 rounded-full p-2 text-xs font-medium hover:bg-[#6C1C74]/5 hover:text-[#6C1C74] transition"
            title="Copy post link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#6C1C74]" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>

          {/* Bookmark / Save Button */}
          {isSignedIn ? (
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1 rounded-full p-2 text-xs font-medium transition ${
                isSaved
                  ? "text-[#6C1C74]"
                  : "hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
              }`}
              title={isSaved ? "Saved" : "Save post"}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? "fill-[#6C1C74] text-[#6C1C74]" : ""}`}
              />
            </button>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full p-2 text-xs font-medium hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        postId={post._id}
        initialContent={content}
        initialCategory={category}
        onPostUpdated={({ content: newContent, category: newCat }) => {
          setContent(newContent);
          setCategory(newCat);
          onPostUpdated?.(post._id, { content: newContent, category: newCat });
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="post"
        targetId={post._id}
      />
    </article>
  );
}
