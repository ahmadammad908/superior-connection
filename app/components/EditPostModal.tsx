"use client";

import { useState } from "react";
import { X, Loader2, Edit3 } from "lucide-react";
import { POST_CATEGORIES, PostCategory } from "../lib/constants";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialContent: string;
  initialCategory: string;
  onPostUpdated: (updatedPost: { content: string; category: string }) => void;
}

export function EditPostModal({
  isOpen,
  onClose,
  postId,
  initialContent,
  initialCategory,
  onPostUpdated,
}: EditPostModalProps) {
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update post.");
      }

      onPostUpdated({ content, category });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#6C1C74]/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#6C1C74]/10 pb-3">
          <div className="flex items-center gap-2 text-[#6C1C74]">
            <Edit3 className="h-5 w-5" />
            <h3 className="text-base font-bold text-gray-900">Edit Post</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl bg-gray-50 border border-[#6C1C74]/20 p-3 text-xs text-[#6C1C74]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
            >
              {POST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
              maxLength={4000}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6C1C74]/20 hover:bg-[#6C1C74]/90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
