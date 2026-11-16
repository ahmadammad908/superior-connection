"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
import { PostCard, PostItem } from "../components/PostCard";

export default function SavedPostsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    fetch("/api/saved")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6C1C74]">
            <Bookmark className="h-6 w-6" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Saved Posts
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#6C1C74]/20 px-3.5 py-1.5 text-xs font-semibold text-[#6C1C74] shadow-xs hover:bg-[#6C1C74]/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Feed</span>
          </Link>
        </div>

        {!isLoaded || loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-[#6C1C74]/40" />
            <h3 className="mt-3 text-base font-bold text-gray-900">
              Sign In to View Saved Posts
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              Bookmark important campus discussions, updates, and notices to find them easily here anytime.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="mt-4 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
              >
                Sign In
              </button>
            </SignInButton>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-[#6C1C74]/30" />
            <h3 className="mt-3 text-base font-bold text-gray-900">
              No Saved Posts Yet
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              When you find a campus post or problem discussion you want to track, tap the bookmark icon to save it here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
            >
              Explore Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
