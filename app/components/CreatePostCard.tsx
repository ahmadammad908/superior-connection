"use client";

import { useState, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Image as ImageIcon,
  Video,
  Send,
  Loader2,
  X,
  EyeOff,
  Pin,
  Megaphone,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { POST_CATEGORIES, PostCategory } from "../lib/constants";

interface CreatePostCardProps {
  onPostCreated: (newPost: any) => void;
  isAdmin?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  Academics: "🎓",
  Hostel: "🏠",
  Transport: "🚌",
  Fees: "💳",
  Exams: "📝",
  Facilities: "🏛️",
  Events: "🎉",
  Other: "💬",
};

export function CreatePostCard({ onPostCreated, isAdmin = false }: CreatePostCardProps) {
  const { isSignedIn, user } = useUser();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("Academics");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      if (type === "image") {
        if (images.length + files.length > 4) {
          throw new Error("Max 4 images allowed per post.");
        }

        let done = 0;
        const uploadPromises = Array.from(files).map(async (file) => {
          if (file.size > 10 * 1024 * 1024)
            throw new Error(`"${file.name}" exceeds 10MB.`);
          const fd = new FormData();
          fd.append("file", file);
          fd.append("type", "image");
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed.");
          done++;
          setUploadProgress(`Uploading ${done}/${files.length}…`);
          return data.url;
        });

        const urls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...urls]);
        setUploadProgress("");
      } else {
        const file = files[0];
        if (file.size > 60 * 1024 * 1024)
          throw new Error(`Video exceeds 60MB limit.`);
        setUploadProgress("Uploading video…");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "video");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");
        setVideo(data.url);
        setUploadProgress("");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed.");
      setUploadProgress("");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const removeVideo = () => setVideo("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && !video) {
      setError("Write something or attach media before posting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          images,
          video,
          category,
          isAnonymous,
          isAnnouncement,
          isPinned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish post.");

      onPostCreated(data.post);
      setContent("");
      setImages([]);
      setVideo("");
      setIsAnonymous(false);
      setIsAnnouncement(false);
      setIsPinned(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasMedia = images.length > 0 || Boolean(video);
  const charCount = content.length;
  const charLimit = 4000;
  const charNearLimit = charCount > charLimit * 0.85;

  /* ───────────────────────────────────────────
     Not signed in state
  ─────────────────────────────────────────── */
  if (!isSignedIn) {
    return (
      <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C1C74] to-[#9B2C9E] text-white shadow-md shadow-[#6C1C74]/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Join the Campus Conversation
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Sign in to voice student problems, share updates, and connect with peers across Superior University.
            </p>
          </div>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-1 rounded-full bg-[#6C1C74] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C1C74]/30 transition hover:bg-[#6C1C74]/90 hover:-translate-y-0.5 active:scale-95"
            >
              Sign In to Post
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────
     Main Post Creation Card
  ─────────────────────────────────────────── */
  return (
    <div
      className={`rounded-3xl border bg-white shadow-sm transition-all duration-200 ${
        focused
          ? "border-[#6C1C74]/40 shadow-md shadow-[#6C1C74]/10"
          : "border-[#6C1C74]/15"
      }`}
    >
      <form onSubmit={handleSubmit}>
        {/* ── Top: Avatar + Textarea ── */}
        <div className="flex gap-3 p-4 pb-3 sm:p-5 sm:pb-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#6C1C74]/20 bg-[#6C1C74]/10">
              {isAnonymous ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                  <EyeOff className="h-4 w-4" />
                </div>
              ) : user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-xs font-bold text-white">
                  {user?.firstName?.charAt(0) || "S"}
                </div>
              )}
            </div>
            {isAnonymous && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-500 ring-1 ring-white">
                <EyeOff className="h-2 w-2 text-white" />
              </span>
            )}
          </div>

          {/* Text area */}
          <div className="flex-1 min-w-0">
            {/* Name + category hint */}
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                {isAnonymous ? "Anonymous" : (user?.firstName || "Student")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#6C1C74]/8 px-2 py-0.5 text-[10px] font-semibold text-[#6C1C74]">
                {CATEGORY_ICONS[category]} {category}
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What's happening on campus? Voice a problem, share a tip, ask a question… Use #tags"
              rows={focused || content ? 4 : 2}
              className="w-full resize-none border-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 leading-relaxed transition-all duration-200"
              maxLength={charLimit}
            />

            {/* Char counter */}
            {charCount > 0 && (
              <div className={`text-right text-[10px] font-medium ${charNearLimit ? "text-orange-500" : "text-gray-300"}`}>
                {charCount}/{charLimit}
              </div>
            )}
          </div>
        </div>

        {/* ── Image Previews Grid ── */}
        {images.length > 0 && (
          <div className="px-4 pb-3 sm:px-5">
            <div
              className={`grid gap-2 overflow-hidden rounded-2xl ${
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                  ? "grid-cols-2"
                  : images.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
              }`}
            >
              {images.map((url, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-xl bg-gray-100 ${
                    images.length === 1
                      ? "aspect-video"
                      : images.length === 4 && i === 3
                      ? "col-span-1 aspect-square"
                      : "aspect-square"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Image number badge */}
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {i + 1}/{images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400 text-right">
              {images.length}/4 images
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="ml-2 text-[#6C1C74] font-semibold hover:underline"
                >
                  + Add more
                </button>
              )}
            </p>
          </div>
        )}

        {/* ── Video Preview ── */}
        {video && (
          <div className="px-4 pb-3 sm:px-5">
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-black">
              <video
                src={video}
                className="max-h-52 w-full object-contain"
                controls
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Upload Progress ── */}
        {uploadProgress && (
          <div className="mx-4 mb-3 sm:mx-5 flex items-center gap-2 rounded-xl bg-[#6C1C74]/5 px-3 py-2 text-xs text-[#6C1C74] font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            {uploadProgress}
          </div>
        )}

        {/* ── Error Banner (Highlighted in Red) ── */}
        {error && (
          <div className="mx-4 mb-3 sm:mx-5 flex items-start gap-2.5 rounded-xl border-2 border-red-500 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-400/30 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto shrink-0 text-red-500 hover:text-red-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Bottom Action Bar (single row, mobile optimized) ── */}
        <div className="flex flex-nowrap items-center gap-2 border-t border-[#6C1C74]/10 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, "image")}
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "video")}
          />

          {/* Left tools: one row, scrolls horizontally if space runs out */}
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1.5">
            {/* Category Selector */}
            <div className="relative shrink-0">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="h-9 max-w-[112px] cursor-pointer appearance-none truncate rounded-full border border-[#6C1C74]/25 bg-[#6C1C74]/5 pl-2.5 pr-6 text-[11px] font-semibold text-[#6C1C74] outline-none transition focus:border-[#6C1C74]/50 focus:ring-1 focus:ring-[#6C1C74]/30 sm:h-auto sm:max-w-none sm:py-1.5 sm:pl-3 sm:pr-7 sm:text-xs"
              >
                {POST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#6C1C74]" />
            </div>

            {/* Image Upload */}
            <button
              type="button"
              disabled={uploading || images.length >= 4 || Boolean(video)}
              onClick={() => imageInputRef.current?.click()}
              title={
                images.length >= 4
                  ? "Max 4 images reached"
                  : video
                  ? "Remove video before adding images"
                  : "Add photos (up to 4)"
              }
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium text-gray-600 transition hover:bg-[#6C1C74]/8 hover:text-[#6C1C74] disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
            >
              <ImageIcon className="h-[18px] w-[18px] text-[#6C1C74] sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Photo</span>
              {images.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6C1C74] px-1 text-[9px] font-bold text-white sm:static">
                  {images.length}
                </span>
              )}
            </button>

            {/* Video Upload */}
            <button
              type="button"
              disabled={uploading || Boolean(video) || images.length > 0}
              onClick={() => videoInputRef.current?.click()}
              title={
                images.length > 0
                  ? "Remove images before adding video"
                  : video
                  ? "1 video already added"
                  : "Add a video (up to 60MB)"
              }
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium text-gray-600 transition hover:bg-[#6C1C74]/8 hover:text-[#6C1C74] disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
            >
              <Video className="h-[18px] w-[18px] text-[#6C1C74] sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Video</span>
              {video && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6C1C74] text-[9px] font-bold text-white sm:static">
                  ✓
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="mx-0.5 hidden h-5 w-px shrink-0 bg-gray-200 sm:block" />

            {/* Anonymous Toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymous((p) => !p)}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 ${
                isAnonymous
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={isAnonymous ? "Posting anonymously" : "Post as yourself"}
            >
              <EyeOff className="h-[18px] w-[18px] sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">
                {isAnonymous ? "Anonymous" : "Anon"}
              </span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsAnnouncement((p) => !p)}
                  title="Mark as announcement"
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 ${
                    isAnnouncement
                      ? "bg-[#6C1C74] text-white"
                      : "bg-[#6C1C74]/8 text-[#6C1C74] hover:bg-[#6C1C74]/15"
                  }`}
                >
                  <Megaphone className="h-[18px] w-[18px] sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Announce</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPinned((p) => !p)}
                  title="Pin post"
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 ${
                    isPinned
                      ? "bg-[#6C1C74] text-white"
                      : "bg-[#6C1C74]/8 text-[#6C1C74] hover:bg-[#6C1C74]/15"
                  }`}
                >
                  <Pin className="h-[18px] w-[18px] sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Pin</span>
                </button>
              </>
            )}
          </div>

          {/* Post Button (always pinned on the right) */}
          <button
            type="submit"
            disabled={submitting || uploading || (!content.trim() && !hasMedia)}
            className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-xs font-bold shadow-md transition-all active:scale-95 sm:h-auto sm:gap-2 sm:px-5 sm:py-2 ${
              submitted
                ? "bg-green-600 text-white shadow-green-600/25"
                : "bg-[#6C1C74] text-white shadow-[#6C1C74]/25 hover:-translate-y-0.5 hover:bg-[#6C1C74]/90"
            } disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {submitting || uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : submitted ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{submitting ? "Posting…" : submitted ? "Posted!" : "Post"}</span>
          </button>
        </div>

        {/* ── Helper text strip (shown when focused or has media) ── */}
        {(focused || hasMedia || isAnonymous) && (
          <div className="border-t border-dashed border-[#6C1C74]/10 px-4 py-2 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400">
              <span>📌 Use <span className="text-[#6C1C74] font-semibold">#hashtags</span> for discovery</span>
              <span>🖼️ Max <span className="font-semibold">4 photos</span> or <span className="font-semibold">1 video</span> per post</span>
              {isAnonymous && (
                <span className="text-gray-600 font-medium">🕵️ Your identity is hidden</span>
              )}
              {isAdmin && isAnnouncement && (
                <span className="text-[#6C1C74] font-semibold">📢 This is an official announcement</span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}