"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  User as UserIcon,
  Edit3,
  Calendar,
  GraduationCap,
  Sparkles,
  Heart,
  FileText,
  Bookmark,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
import { PostCard, PostItem } from "../components/PostCard";
import { EditProfileModal } from "../components/EditProfileModal";

export default function MyProfilePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchProfileAndPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);

        if (data.user) {
          // Fetch own posts
          const postsRes = await fetch(
            `/api/posts?username=${data.user.username}&limit=30`
          );
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);
          }

          // Fetch saved posts
          const savedRes = await fetch("/api/saved");
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedPosts(savedData.posts || []);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchProfileAndPosts();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
        <SiteHeader />
        <main className="flex-1 mx-auto w-full max-w-md px-4 py-16 text-center">
          <div className="rounded-3xl border border-[#6C1C74]/20 bg-white p-8 shadow-sm">
            <UserIcon className="mx-auto h-12 w-12 text-[#6C1C74]" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Sign In to View Your Profile
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              Manage your student profile, view your posted campus problems, and track saved discussions.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-[#6C1C74] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C1C74]/20 hover:bg-[#6C1C74]/90"
              >
                Sign In
              </button>
            </SignInButton>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#6C1C74]/30 bg-[#6C1C74]/10">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#6C1C74] text-xl font-bold text-white">
                    {profile?.name?.charAt(0) || "S"}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {profile?.name}
                  </h1>
                  {profile?.role === "admin" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#6C1C74]/10 px-2 py-0.5 text-[10px] font-bold text-[#6C1C74]">
                      <ShieldCheck className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  @{profile?.username}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                  {profile?.department && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-[#6C1C74]" />
                      {profile.department}
                    </span>
                  )}
                  {profile?.semester && <span>· {profile.semester}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6C1C74]/20 bg-[#6C1C74]/5 px-4 py-2 text-xs font-semibold text-[#6C1C74] transition hover:bg-[#6C1C74] hover:text-white"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {profile?.bio && (
            <p className="mt-4 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
              {profile.bio}
            </p>
          )}

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#6C1C74]/10 pt-4">
            <div className="rounded-2xl bg-[#6C1C74]/5 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#6C1C74]">
                {profile?.postsCount || posts.length}
              </span>
              <span className="text-[11px] font-medium text-gray-600">
                Discussions Posted
              </span>
            </div>
            <div className="rounded-2xl bg-[#6C1C74]/5 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#6C1C74]">
                {savedPosts.length}
              </span>
              <span className="text-[11px] font-medium text-gray-600">
                Saved Discussions
              </span>
            </div>
          </div>
        </div>

        {/* Tabs: My Posts vs Saved */}
        <div className="flex border-b border-[#6C1C74]/15">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition ${
              activeTab === "posts"
                ? "border-[#6C1C74] text-[#6C1C74]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>My Posts ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition ${
              activeTab === "saved"
                ? "border-[#6C1C74] text-[#6C1C74]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "posts" ? (
            posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-10 text-center">
                <p className="text-xs text-gray-500">
                  You haven&apos;t published any campus discussions yet.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
                >
                  Create a Post
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  isAdmin={profile?.role === "admin"}
                />
              ))
            )
          ) : savedPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#6C1C74]/20 bg-white p-10 text-center">
              <p className="text-xs text-gray-500">
                You have no saved posts.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                isAdmin={profile?.role === "admin"}
              />
            ))
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          initialData={profile}
          onProfileUpdated={(updated) => {
            setProfile((prev: any) => ({ ...prev, ...updated }));
          }}
        />
      )}

      <Footer />
    </div>
  );
}
