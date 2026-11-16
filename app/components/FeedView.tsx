"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import { CreatePostCard } from "./CreatePostCard";
import { PostCard, PostItem } from "./PostCard";
import { BanNoticeBanner } from "./BanNoticeBanner";
import { POST_CATEGORIES, PostCategory } from "../lib/constants";

export function FeedView() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sort, setSort] = useState<"latest" | "trending">("latest");
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.isAdmin) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  // Handle URL query changes
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    setDebouncedQuery(q);
  }, [searchParams]);

  // Debounce search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }
        params.set("sort", sort);
        if (debouncedQuery.trim()) {
          params.set("q", debouncedQuery.trim());
        }
        params.set("page", String(pageNum));
        params.set("limit", "10");

        const res = await fetch(`/api/posts?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (append) {
            setPosts((prev) => [...prev, ...(data.posts || [])]);
          } else {
            setPosts(data.posts || []);
          }
          setHasMore(Boolean(data.hasMore));
          setPage(pageNum);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, sort, debouncedQuery]
  );

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handlePostCreated = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (postId: string, updated: Partial<PostItem>) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updated } : p))
    );
  };

  const categories = ["All", ...POST_CATEGORIES];

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Notice Banner if user is banned/suspended */}
      <BanNoticeBanner />

      {/* Hero Welcome Banner */}
      <div className="rounded-3xl border border-[#6C1C74]/20 bg-gradient-to-br from-[#6C1C74] via-[#6C1C74]/95 to-[#531359] p-6 text-white shadow-xl shadow-[#6C1C74]/15">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200">
          <GraduationCap className="h-4 w-4" />
          <span>University Campus Network</span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Superior Student Forum
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
          The single one-window space to raise campus problems, ask hostel & exam questions,
          discuss transport or fees, and connect with peers across all departments.
        </p>
      </div>

      {/* Create Post Form */}
      <CreatePostCard onPostCreated={handlePostCreated} isAdmin={isAdmin} />

      {/* Filters, Search & Sorting Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, keywords, or #hashtags (#hostel, #academics)..."
            className="w-full rounded-2xl border border-[#6C1C74]/15 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 outline-none shadow-xs focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#6C1C74] text-white shadow-sm shadow-[#6C1C74]/25"
                    : "bg-white text-gray-700 border border-[#6C1C74]/15 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Controls (Latest vs Trending) */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-gray-500">
            {selectedCategory === "All" ? "All Discussions" : `${selectedCategory} Discussions`}
            {debouncedQuery && ` matching "${debouncedQuery}"`}
          </span>

          <div className="inline-flex rounded-full bg-[#6C1C74]/5 p-0.5 border border-[#6C1C74]/10">
            <button
              onClick={() => setSort("latest")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                sort === "latest"
                  ? "bg-white text-[#6C1C74] shadow-xs"
                  : "text-gray-600 hover:text-[#6C1C74]"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setSort("trending")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                sort === "trending"
                  ? "bg-white text-[#6C1C74] shadow-xs"
                  : "text-gray-600 hover:text-[#6C1C74]"
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-[#6C1C74]/10 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-40 rounded bg-gray-100" />
                  </div>
                </div>
                <div className="h-16 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6C1C74]/10 text-[#6C1C74] mb-3">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No posts found</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              {debouncedQuery
                ? `No posts matched "${debouncedQuery}". Try another keyword or clear filters.`
                : "No posts in this category yet. Start the conversation!"}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              isAdmin={isAdmin}
            />
          ))
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="pt-4 text-center">
            <button
              onClick={() => fetchPosts(page + 1, true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-[#6C1C74]/20 bg-white px-6 py-2.5 text-xs font-semibold text-[#6C1C74] shadow-xs hover:bg-[#6C1C74]/5 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading more...</span>
                </>
              ) : (
                <span>Load More Discussions</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default FeedView;
