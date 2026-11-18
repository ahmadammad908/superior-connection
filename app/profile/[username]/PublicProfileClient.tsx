"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  GraduationCap,
  Heart,
  FileText,
  Loader2,
  ShieldCheck,
  Flag,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import Footer from "../../components/Footer";
import { PostCard, PostItem } from "../../components/PostCard";
import { ReportModal } from "../../components/ReportModal";
import { VerifiedBadge } from "../../components/VerifiedBadge";

export function PublicProfileClient({ username }: { username: string }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${username}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Student not found");
        return res.json();
      })
      .then((data) => {
        setProfile(data.user);
        return fetch(`/api/posts?username=${username}&limit=30`);
      })
      .then((res) => res.json())
      .then((postsData) => {
        setPosts(postsData.posts || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load student profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#6C1C74]/20 px-3.5 py-1.5 text-xs font-semibold text-[#6C1C74] shadow-xs hover:bg-[#6C1C74]/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Feed</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
          </div>
        ) : error || !profile ? (
          <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-12 text-center">
            <h3 className="text-base font-bold text-gray-900">
              {error || "Student not found"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              The student profile you are looking for does not exist or may have been deleted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Profile Card */}
            <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#6C1C74]/30 bg-[#6C1C74]/10">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-xl font-bold text-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{profile.name}</span>
                        {profile.role === "admin" && (
                          <VerifiedBadge size={20} />
                        )}
                      </h1>
                      {profile.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0095F6]/10 text-[#0095F6] border border-[#0095F6]/20 px-2.5 py-0.5 text-[11px] font-bold">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      @{profile.username}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      {profile.department && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-[#6C1C74]" />
                          {profile.department}
                        </span>
                      )}
                      {profile.semester && <span>· {profile.semester}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {user?.id !== profile.clerkId && (
                    <Link
                      href={`/messages?u=${profile.username}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#6C1C74]/25 hover:bg-[#6C1C74]/90 transition active:scale-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report Student</span>
                  </button>
                </div>
              </div>

              {profile.bio && (
                <p className="mt-4 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#6C1C74]/10 pt-4">
                <div className="rounded-2xl bg-[#6C1C74]/5 p-3 text-center">
                  <span className="block text-lg font-extrabold text-[#6C1C74]">
                    {profile.postsCount || posts.length}
                  </span>
                  <span className="text-[11px] font-medium text-gray-600">
                    Discussions Posted
                  </span>
                </div>
                <div className="rounded-2xl bg-[#6C1C74]/5 p-3 text-center">
                  <span className="block text-lg font-extrabold text-[#6C1C74]">
                    {profile.totalLikes || 0}
                  </span>
                  <span className="text-[11px] font-medium text-gray-600">
                    Total Likes Received
                  </span>
                </div>
              </div>
            </div>

            {/* Student Posts */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Discussions by {profile.name} ({posts.length})
              </h2>

              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-10 text-center">
                  <p className="text-xs text-gray-500">
                    This student hasn&apos;t posted any public discussions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Report Student Modal */}
      {profile && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="user"
          targetId={profile.username}
        />
      )}

      <Footer />
    </div>
  );
}
