"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import Footer from "../../components/Footer";
import { PostCard, PostItem } from "../../components/PostCard";
import { CommentSection } from "../../components/CommentSection";

export function PostDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Post not found");
        }
        return res.json();
      })
      .then((data) => {
        setPost(data.post);
      })
      .catch((err) => {
        setError(err.message || "Failed to load post.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#6C1C74]/20 px-3.5 py-1.5 text-xs font-semibold text-[#6C1C74] shadow-xs hover:bg-[#6C1C74]/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Feed</span>
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
          </div>
        ) : error || !post ? (
          <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-12 text-center">
            <h3 className="text-base font-bold text-gray-900">
              {error || "Post not found"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              This post may have been deleted or removed by moderators.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <PostCard
              post={post}
              onPostDeleted={() => router.push("/")}
              isAdmin={isAdmin}
            />

            <CommentSection postId={post._id} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
