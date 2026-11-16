"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Pin,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ExternalLink,
  Ban,
  Eye,
  Megaphone,
  X,
  Send,
  AlertCircle,
} from "lucide-react";
import { POST_CATEGORIES, REPORT_REASONS } from "../lib/constants";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "posts" | "reports" | "users" | "announcement"
  >("overview");

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReports: 0,
    pendingReports: 0,
    bannedUsers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postSearch, setPostSearch] = useState("");

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFilter, setReportFilter] = useState("pending");

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userBannedFilter, setUserBannedFilter] = useState("all");

  // Ban Dialog state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [submittingBan, setSubmittingBan] = useState(false);

  // Announcement state
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementCategory, setAnnouncementCategory] = useState("Academics");
  const [announcementPin, setAnnouncementPin] = useState(true);
  const [publishingAnnouncement, setPublishingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Load stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentPosts(data.recentPosts || []);
        setRecentReports(data.recentReports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load posts
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const q = postSearch.trim() ? `&q=${encodeURIComponent(postSearch.trim())}` : "";
      const res = await fetch(`/api/posts?limit=50${q}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${reportFilter}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };

  // Load users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (userSearch.trim()) params.set("q", userSearch.trim());
      if (userBannedFilter === "banned") params.set("banned", "true");
      if (userBannedFilter === "active") params.set("banned", "false");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "posts") fetchPosts();
    else if (activeTab === "reports") fetchReports();
    else if (activeTab === "users") fetchUsers();
  }, [activeTab, reportFilter, userBannedFilter]);

  // Post Actions
  const handleTogglePin = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, isPinned: data.isPinned } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post permanently from public feed?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        setStats((prev: any) => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Report Actions
  const handleReportAction = async (reportId: string, action: string, notes?: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action, notes }),
      });
      if (res.ok) {
        fetchReports();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ban / Unban actions
  const handleOpenBanModal = (user: any) => {
    setTargetUser(user);
    setBanReason("");
    setBanDuration("permanent");
    setBanModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!targetUser) return;
    setSubmittingBan(true);
    try {
      const durationDays =
        banDuration === "1d"
          ? 1
          : banDuration === "3d"
          ? 3
          : banDuration === "7d"
          ? 7
          : banDuration === "30d"
          ? 30
          : 0;

      const res = await fetch(`/api/admin/users/${targetUser._id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ban",
          reason: banReason || "Violation of campus guidelines",
          durationDays,
        }),
      });

      if (res.ok) {
        setBanModalOpen(false);
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingBan(false);
    }
  };

  const handleUnbanUser = async (user: any) => {
    if (!confirm(`Unban student @${user.username}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user._id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban" }),
      });
      if (res.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setPublishingAnnouncement(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: announcementText.trim(),
          category: announcementCategory,
          isAnnouncement: true,
          isPinned: announcementPin,
          isAnonymous: false,
        }),
      });

      if (res.ok) {
        setAnnouncementSuccess(true);
        setAnnouncementText("");
        fetchStats();
        setTimeout(() => setAnnouncementSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#6C1C74]/15 bg-white p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C1C74] text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold text-gray-900">
              Superior Admin Moderation
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Control campus content, moderate student reports, manage bans & post university announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#6C1C74]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6C1C74] hover:bg-[#6C1C74]/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Students</span>
            <Users className="h-4 w-4 text-[#6C1C74]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.totalUsers}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Discussions</span>
            <FileText className="h-4 w-4 text-[#6C1C74]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.totalPosts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Comments</span>
            <MessageSquare className="h-4 w-4 text-[#6C1C74]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.totalComments}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Total Reports</span>
            <AlertTriangle className="h-4 w-4 text-[#6C1C74]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.totalReports}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-medium">Pending Reports</span>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-red-700">
            {stats.pendingReports}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6C1C74]/15 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Banned Users</span>
            <Ban className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.bannedUsers}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#6C1C74]/15 bg-white rounded-2xl px-2 shadow-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "overview"
              ? "border-[#6C1C74] text-[#6C1C74]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "posts"
              ? "border-[#6C1C74] text-[#6C1C74]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Posts Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "reports"
              ? "border-[#6C1C74] text-[#6C1C74]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Reports</span>
          {stats.pendingReports > 0 && (
            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] text-white font-bold">
              {stats.pendingReports}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "users"
              ? "border-[#6C1C74] text-[#6C1C74]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "announcement"
              ? "border-[#6C1C74] text-[#6C1C74]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Official Announcement</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#6C1C74]" />
                Recent Reports
              </h3>
              <button
                onClick={() => setActiveTab("reports")}
                className="text-xs font-semibold text-[#6C1C74] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {recentReports.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-500">
                  No reports submitted yet.
                </p>
              ) : (
                recentReports.map((r) => (
                  <div key={r._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {r.targetType.toUpperCase()}: {r.reason}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Reported by {r.reporterName || "Student"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#6C1C74]" />
                Recent Discussions
              </h3>
              <button
                onClick={() => setActiveTab("posts")}
                className="text-xs font-semibold text-[#6C1C74] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {recentPosts.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-500">
                  No discussions created yet.
                </p>
              ) : (
                recentPosts.map((p) => (
                  <div key={p._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {p.content || "[Media Post]"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {p.authorName} · {p.category}
                      </p>
                    </div>
                    <Link
                      href={`/post/${p._id}`}
                      className="shrink-0 p-1 text-gray-400 hover:text-[#6C1C74]"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Posts Moderation */}
      {activeTab === "posts" && (
        <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900">
              All Campus Discussions ({posts.length})
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
                  placeholder="Search posts..."
                  className="w-full rounded-full border border-gray-200 py-1.5 pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-[#6C1C74]"
                />
              </div>
              <button
                onClick={fetchPosts}
                className="rounded-full bg-[#6C1C74] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#6C1C74]/90"
              >
                Search
              </button>
            </div>
          </div>

          {loadingPosts ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500">
              No posts found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2.5 px-3">Author</th>
                    <th className="py-2.5 px-3">Content Preview</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Likes / Comments</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {post.author.name}
                        </div>
                        {post.isAnonymous && post.realAuthor && (
                          <div className="text-[10px] font-bold text-[#6C1C74]">
                            Real: @{post.realAuthor.username}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="truncate text-gray-800">{post.content}</p>
                        {post.images?.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            [{post.images.length} images]
                          </span>
                        )}
                        {post.video && (
                          <span className="text-[10px] text-gray-400">
                            {" "}[1 video]
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-[#6C1C74]/5 px-2 py-0.5 text-[11px] font-semibold text-[#6C1C74]">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {post.likesCount} ❤️ / {post.commentsCount} 💬
                      </td>
                      <td className="py-3 px-3">
                        {post.isPinned && (
                          <span className="rounded bg-[#6C1C74] px-1.5 py-0.5 text-[10px] font-bold text-white mr-1">
                            Pinned
                          </span>
                        )}
                        {post.isAnnouncement && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-[#6C1C74]">
                            Announcement
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTogglePin(post._id)}
                            className="rounded-full p-1.5 text-gray-500 hover:bg-[#6C1C74]/10 hover:text-[#6C1C74]"
                            title={post.isPinned ? "Unpin" : "Pin to top"}
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            href={`/post/${post._id}`}
                            className="rounded-full p-1.5 text-gray-500 hover:bg-[#6C1C74]/10 hover:text-[#6C1C74]"
                            title="View post"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reports Management */}
      {activeTab === "reports" && (
        <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900">
              Moderation Reports ({reports.length})
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filter:</span>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
                <option value="all">All Reports</option>
              </select>
            </div>
          </div>

          {loadingReports ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500">
              No reports in this category.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="rounded-2xl border border-gray-200 p-4 space-y-3 hover:border-[#6C1C74]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 uppercase">
                          {report.targetType}
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {report.reason}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Reported by <strong>{report.reporterName || "Student"}</strong> on{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        report.status === "pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {report.details && (
                    <div className="rounded-xl bg-gray-50 p-2.5 text-xs text-gray-700">
                      <strong>Reporter Notes:</strong> {report.details}
                    </div>
                  )}

                  {/* Target Preview */}
                  {report.post && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs">
                      <span className="font-bold text-gray-700">Reported Post Content:</span>
                      <p className="mt-0.5 text-gray-800 line-clamp-2">
                        {report.post.content}
                      </p>
                    </div>
                  )}
                  {report.comment && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs">
                      <span className="font-bold text-gray-700">Reported Comment Body:</span>
                      <p className="mt-0.5 text-gray-800">
                        {report.comment.body}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {report.status === "pending" && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleReportAction(report._id, "dismiss")}
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReportAction(report._id, "delete_content")}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete Content
                      </button>
                      <button
                        onClick={() =>
                          handleReportAction(
                            report._id,
                            "warn_user",
                            `Official warning regarding reported content for ${report.reason}`
                          )
                        }
                        className="rounded-full border border-[#6C1C74] bg-[#6C1C74]/5 px-3 py-1 text-xs font-semibold text-[#6C1C74] hover:bg-[#6C1C74]/15"
                      >
                        Warn User
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: User Management */}
      {activeTab === "users" && (
        <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900">
              Students & Accounts ({users.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userBannedFilter}
                onChange={(e) => setUserBannedFilter(e.target.value)}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="banned">Banned / Suspended</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  placeholder="Search student name or @username..."
                  className="rounded-full border border-gray-200 py-1 pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-[#6C1C74]"
                />
              </div>

              <button
                onClick={fetchUsers}
                className="rounded-full bg-[#6C1C74] px-3.5 py-1 text-xs font-semibold text-white hover:bg-[#6C1C74]/90"
              >
                Search
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500">
              No students found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Department & Semester</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-[11px] text-gray-500">
                          @{u.username}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {u.department || "General"} {u.semester && `· ${u.semester}`}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-[#6C1C74] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {u.isBanned ? (
                          <div>
                            <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              {u.bannedUntil
                                ? `Suspended until ${new Date(u.bannedUntil).toLocaleDateString()}`
                                : "Banned"}
                            </span>
                            {u.banReason && (
                              <p className="mt-0.5 text-[10px] text-red-600 truncate max-w-xs">
                                {u.banReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.role !== "admin" && (
                          u.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(u)}
                              className="rounded-full border border-green-600 px-3 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-50"
                            >
                              Lift Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBanModal(u)}
                              className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                            >
                              Ban / Suspend
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Create Official Announcement */}
      {activeTab === "announcement" && (
        <div className="rounded-3xl border border-[#6C1C74]/15 bg-white p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#6C1C74]">
              <Megaphone className="h-5 w-5" />
              <h3 className="text-base font-bold text-gray-900">
                Publish Official Campus Announcement
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Official announcements appear with verified Superior badge and can be pinned to the top of the feed for all students.
            </p>
          </div>

          {announcementSuccess && (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Announcement published successfully and pinned to campus feed!</span>
            </div>
          )}

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={announcementCategory}
                onChange={(e) => setAnnouncementCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#6C1C74]"
              >
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Announcement Message
              </label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Important update for Superior students regarding exams, hostel deadlines, transport routes, or events..."
                rows={5}
                className="w-full rounded-2xl border border-gray-200 p-3 text-xs sm:text-sm text-gray-900 outline-none focus:border-[#6C1C74]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={announcementPin}
                  onChange={(e) => setAnnouncementPin(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#6C1C74] focus:ring-[#6C1C74]"
                />
                <span>Pin announcement to the top of the feed</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={publishingAnnouncement || !announcementText.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#6C1C74]/20 hover:bg-[#6C1C74]/90 disabled:opacity-50"
            >
              {publishingAnnouncement && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Megaphone className="h-3.5 w-3.5" />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>
      )}

      {/* Ban / Suspend Modal */}
      {banModalOpen && targetUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setBanModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#6C1C74]/20 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Suspend / Ban Student: {targetUser.name}
              </h3>
              <button
                onClick={() => setBanModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 outline-none"
              >
                <option value="1d">1 Day Suspension</option>
                <option value="3d">3 Days Suspension</option>
                <option value="7d">7 Days Suspension</option>
                <option value="30d">30 Days Suspension</option>
                <option value="permanent">Permanent Ban</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for suspension/ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Specify the reason (e.g. repeated abusive comments, harassment, false rumors)..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBanModalOpen(false)}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={submittingBan}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submittingBan && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;
