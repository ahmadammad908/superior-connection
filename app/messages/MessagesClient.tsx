"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  MessageCircle,
  Search,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  X,
  ExternalLink,
  UserPlus,
  Check,
  CheckCheck,
  User,
  GraduationCap,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";

export interface OtherUser {
  clerkId: string;
  name: string;
  username: string;
  avatar?: string;
  department?: string;
  role?: string;
  isBanned?: boolean;
}

export interface ConversationItem {
  _id: string;
  otherUser: OtherUser;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId?: string;
  isUnread: boolean;
}

export interface MessageItem {
  _id: string;
  senderId: string;
  recipientId: string;
  text: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
  isOwn: boolean;
}

export interface SearchUserItem {
  clerkId: string;
  name: string;
  username: string;
  avatar?: string;
  department?: string;
  semester?: string;
  role?: string;
}

function formatMessageTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatConversationTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessagesClient() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUsernameParam = searchParams.get("u");
  const targetConversationIdParam = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Search in conversation list
  const [searchQuery, setSearchQuery] = useState("");

  // Input states
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachedImageFile, setAttachedImageFile] = useState<File | null>(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // New Chat Modal state
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        return data.conversations as ConversationItem[];
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
    return [];
  }, []);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(
    async (convId: string, silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${convId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          if (!silent) {
            setTimeout(() => scrollToBottom(false), 50);
          }
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

  // Start or open conversation with a specific user
  const openConversationWithUser = useCallback(
    async (target: { targetUsername?: string; targetUserId?: string }) => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(target),
        });

        if (res.ok) {
          const data = await res.json();
          const conv: ConversationItem = data.conversation;

          // Update conversations list
          setConversations((prev) => {
            const exists = prev.some((c) => c._id === conv._id);
            if (exists) {
              return prev.map((c) => (c._id === conv._id ? conv : c));
            }
            return [conv, ...prev];
          });

          setActiveConversation(conv);
          fetchMessages(conv._id);
          setNewChatModalOpen(false);

          // Update URL without full reload
          router.replace(`/messages?id=${conv._id}`);
          setTimeout(() => inputRef.current?.focus(), 150);
        } else {
          const errData = await res.json();
          alert(errData.error || "Could not open conversation.");
        }
      } catch (err) {
        console.error("Error creating/opening conversation:", err);
        alert("Failed to start conversation.");
      }
    },
    [fetchMessages, router]
  );

  // Initial load
  useEffect(() => {
    if (!isSignedIn) return;

    fetchConversations().then((loadedList) => {
      // If targetUsername was provided in URL (?u=...)
      if (targetUsernameParam) {
        openConversationWithUser({ targetUsername: targetUsernameParam });
      } else if (targetConversationIdParam && loadedList.length > 0) {
        const found = loadedList.find((c) => c._id === targetConversationIdParam);
        if (found) {
          setActiveConversation(found);
          fetchMessages(found._id);
        }
      }
    });
  }, [
    isSignedIn,
    targetUsernameParam,
    targetConversationIdParam,
    fetchConversations,
    openConversationWithUser,
    fetchMessages,
  ]);

  // Live polling: Poll active conversation every 3s
  useEffect(() => {
    if (!isSignedIn || !activeConversation) return;

    const interval = setInterval(() => {
      fetchMessages(activeConversation._id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSignedIn, activeConversation, fetchMessages]);

  // Polling conversation list every 6s
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(() => {
      fetchConversations(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [isSignedIn, fetchConversations]);

  // Auto-resize message textarea (also resets height after sending)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [inputText, activeConversation]);

  // Handle User Search for New Chat Modal
  useEffect(() => {
    if (!newChatModalOpen) {
      setSearchResults([]);
      setUserSearchQuery("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const queryParam = encodeURIComponent(userSearchQuery.trim());
        const res = await fetch(`/api/users?query=${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userSearchQuery, newChatModalOpen]);

  // Handle selecting conversation from list
  const handleSelectConversation = (conv: ConversationItem) => {
    setActiveConversation(conv);
    fetchMessages(conv._id);
    router.replace(`/messages?id=${conv._id}`);

    // Mark as read locally in conversation list
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, isUnread: false } : c))
    );
  };

  // Image attachment change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are supported in messages.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    setAttachedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAttachedImagePreview(previewUrl);
  };

  const removeAttachedImage = () => {
    setAttachedImageFile(null);
    if (attachedImagePreview) {
      URL.revokeObjectURL(attachedImagePreview);
      setAttachedImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || isSending) return;

    const textToSend = inputText.trim();
    if (!textToSend && !attachedImageFile) return;

    setIsSending(true);

    try {
      let uploadedMediaUrl = "";

      // If an image is attached, upload it first
      if (attachedImageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("file", attachedImageFile);
        formData.append("type", "image");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Failed to upload attached image.");
        }

        const uploadData = await uploadRes.json();
        uploadedMediaUrl = uploadData.url;
        setIsUploadingImage(false);
      }

      // Optimistic message item
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: MessageItem = {
        _id: optimisticId,
        senderId: user?.id || "",
        recipientId: activeConversation.otherUser.clerkId,
        text: textToSend,
        mediaUrl: uploadedMediaUrl,
        read: false,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setInputText("");
      removeAttachedImage();
      setTimeout(() => scrollToBottom(true), 50);

      // Post message to backend
      const res = await fetch(
        `/api/conversations/${activeConversation._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSend,
            mediaUrl: uploadedMediaUrl,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const serverMessage: MessageItem = data.message;
        // Replace optimistic message
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticId ? serverMessage : m))
        );

        // Update conversation in sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? {
                  ...c,
                  lastMessage:
                    textToSend || (uploadedMediaUrl ? "[Photo]" : "New message"),
                  lastMessageAt: new Date().toISOString(),
                  lastMessageSenderId: user?.id,
                  isUnread: false,
                }
              : c
          )
        );
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to send message.");
        // Revert optimistic
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      }
    } catch (err: any) {
      console.error("Send message error:", err);
      alert(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
      setIsUploadingImage(false);
    }
  };

  // Key press (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations in sidebar
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser.name.toLowerCase().includes(q) ||
      c.otherUser.username.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  // Not signed in state
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-[#6C1C74]/20 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C1C74]/10 text-[#6C1C74] mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Sign In to Message Students
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join Superior Connection to send private direct messages and connect
              with classmates and friends across campus.
            </p>
            <div className="mt-6">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full rounded-full bg-[#6C1C74] py-3 text-sm font-bold text-white shadow-md shadow-[#6C1C74]/25 hover:bg-[#6C1C74]/90 transition"
                >
                  Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="h-full bg-white rounded-3xl border border-[#6C1C74]/15 shadow-sm overflow-hidden flex flex-row">
          {/* ================= LEFT SIDEBAR: CONVERSATION LIST ================= */}
          <section
            className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#6C1C74]/10 bg-white shrink-0 ${
              activeConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#6C1C74]/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C1C74]/10 text-[#6C1C74]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    Messages
                  </h1>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {conversations.length}{" "}
                    {conversations.length === 1 ? "conversation" : "conversations"}
                  </span>
                </div>
              </div>

              {/* New Message Button */}
              <button
                type="button"
                onClick={() => setNewChatModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6C1C74]/90 transition active:scale-95"
                title="Start a new message"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search Existing Conversations */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs placeholder:text-gray-400 focus:border-[#6C1C74] focus:outline-none focus:ring-1 focus:ring-[#6C1C74]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loadingConversations ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
                  <span className="mt-2 text-xs font-medium">
                    Loading conversations...
                  </span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-16 px-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C1C74]/10 text-[#6C1C74] mb-3">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {searchQuery ? "No chats found" : "No messages yet"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                    {searchQuery
                      ? "Try searching for another student's name or username."
                      : "Start a conversation with any student at Superior University."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setNewChatModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#6C1C74]/30 bg-[#6C1C74]/5 px-4 py-1.5 text-xs font-semibold text-[#6C1C74] hover:bg-[#6C1C74]/10 transition"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Search Students</span>
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = activeConversation?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleSelectConversation(c)}
                      className={`w-full flex items-center gap-3 p-3.5 text-left transition relative ${
                        isSelected
                          ? "bg-[#6C1C74]/10 border-l-4 border-l-[#6C1C74]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full overflow-hidden bg-[#6C1C74]/10 border border-[#6C1C74]/20 flex items-center justify-center text-sm font-bold text-[#6C1C74]">
                          {c.otherUser.avatar ? (
                            <img
                              src={c.otherUser.avatar}
                              alt={c.otherUser.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            c.otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {c.isUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#6C1C74] ring-2 ring-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-sm truncate ${
                              c.isUnread
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-800"
                            }`}
                          >
                            {c.otherUser.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatConversationTime(c.lastMessageAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p
                            className={`text-xs truncate ${
                              c.isUnread
                                ? "font-semibold text-[#6C1C74]"
                                : "text-gray-500"
                            }`}
                          >
                            {c.lastMessageSenderId === user?.id && (
                              <span className="text-gray-400">You: </span>
                            )}
                            {c.lastMessage || "Started a conversation"}
                          </p>

                          {c.isUnread && (
                            <span className="shrink-0 rounded-full bg-[#6C1C74] px-1.5 py-0.5 text-[9px] font-bold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* ================= RIGHT MAIN: ACTIVE CONVERSATION ================= */}
          <section
            className={`flex-1 flex flex-col bg-white overflow-hidden ${
              !activeConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-[#6C1C74]/10 bg-white flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      type="button"
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    {/* Recipient Avatar */}
                    <Link
                      href={`/profile/${activeConversation.otherUser.username}`}
                      className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-[#6C1C74]/10 border border-[#6C1C74]/20 flex items-center justify-center text-sm font-bold text-[#6C1C74] hover:opacity-90"
                    >
                      {activeConversation.otherUser.avatar ? (
                        <img
                          src={activeConversation.otherUser.avatar}
                          alt={activeConversation.otherUser.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        activeConversation.otherUser.name.charAt(0).toUpperCase()
                      )}
                    </Link>

                    {/* Recipient Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/profile/${activeConversation.otherUser.username}`}
                          className="font-bold text-sm text-gray-900 hover:text-[#6C1C74] truncate"
                        >
                          {activeConversation.otherUser.name}
                        </Link>
                        {activeConversation.otherUser.role === "admin" && (
                          <span className="rounded-full bg-[#6C1C74]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#6C1C74]">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>@{activeConversation.otherUser.username}</span>
                        {activeConversation.otherUser.department && (
                          <span className="truncate">
                            · {activeConversation.otherUser.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${activeConversation.otherUser.username}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[#6C1C74]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#6C1C74] hover:bg-[#6C1C74]/5 transition"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Profile</span>
                      <ExternalLink className="h-3 w-3 sm:hidden" />
                    </Link>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#faf9fb]">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="h-16 w-16 rounded-full bg-[#6C1C74]/10 flex items-center justify-center text-[#6C1C74] mb-3">
                        <MessageCircle className="h-8 w-8" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">
                        No messages yet
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 max-w-xs">
                        Say hello to {activeConversation.otherUser.name} and start
                        the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div
                          key={m._id || index}
                          className={`flex flex-col ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5 shadow-2xs ${
                              isMe
                                ? "bg-[#6C1C74] text-white rounded-br-xs"
                                : "bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs"
                            }`}
                          >
                            {/* Attached Image if any */}
                            {m.mediaUrl && (
                              <div className="mb-2 overflow-hidden rounded-xl bg-black/5">
                                <a
                                  href={m.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={m.mediaUrl}
                                    alt="Shared attachment"
                                    className="max-h-60 w-auto rounded-xl object-cover hover:opacity-95 transition"
                                  />
                                </a>
                              </div>
                            )}

                            {/* Message Text */}
                            {m.text && (
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {m.text}
                              </p>
                            )}

                            {/* Meta info (Time + read check) */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? "text-white/70" : "text-gray-400"
                              }`}
                            >
                              <span>{formatMessageTime(m.createdAt)}</span>
                              {isMe && (
                                <span>
                                  {m.read ? (
                                    <CheckCheck className="h-3 w-3 text-white" />
                                  ) : (
                                    <Check className="h-3 w-3 text-white/70" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <div className="p-3 sm:p-4 border-t border-[#6C1C74]/10 bg-white">
                  {/* Image Attachment Preview */}
                  {attachedImagePreview && (
                    <div className="mb-2 flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 max-w-sm">
                      <img
                        src={attachedImagePreview}
                        alt="Preview"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-700 truncate block">
                          {attachedImageFile?.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {attachedImageFile
                            ? `${(attachedImageFile.size / 1024).toFixed(0)} KB`
                            : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachedImage}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2"
                  >
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {/* Image Attachment Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending || isUploadingImage}
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#6C1C74]/30 hover:bg-[#6C1C74]/5 hover:text-[#6C1C74] transition"
                      title="Attach photo"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        className="block w-full min-h-[42px] max-h-32 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 px-4 py-[9px] text-[16px] leading-6 text-gray-900 placeholder:text-gray-400 focus:border-[#6C1C74] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C1C74] sm:text-sm sm:leading-6"
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={
                        (!inputText.trim() && !attachedImageFile) ||
                        isSending ||
                        isUploadingImage
                      }
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#6C1C74] text-white shadow-md shadow-[#6C1C74]/20 transition hover:bg-[#6C1C74]/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isSending || isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Active Conversation Selected (Desktop Empty State) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/40">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6C1C74]/10 text-[#6C1C74] mb-4 shadow-xs">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Select a Conversation
                </h3>
                <p className="mt-1.5 text-xs text-gray-500 max-w-sm">
                  Choose a chat from the left or search for any student at Superior
                  University to send a direct message.
                </p>
                <button
                  type="button"
                  onClick={() => setNewChatModalOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6C1C74] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C1C74]/25 hover:bg-[#6C1C74]/90 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Start New Message</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ================= NEW CHAT / USER SEARCH MODAL ================= */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-[#6C1C74]/20 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C1C74]/10 text-[#6C1C74]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    New Message
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Search and chat with any student
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewChatModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by student name, @username, or department..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 pl-10 pr-4 py-2.5 text-[16px] sm:text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#6C1C74] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C1C74]"
              />
            </div>

            {/* Student Search Results */}
            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-gray-50">
              {isSearchingUsers ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#6C1C74]" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  {userSearchQuery
                    ? "No students found matching your search."
                    : "Type a name or username to search students."}
                </div>
              ) : (
                searchResults.map((stu) => {
                  const isStarting = startingChatUserId === stu.clerkId;
                  return (
                    <button
                      key={stu.clerkId}
                      type="button"
                      disabled={isStarting}
                      onClick={async () => {
                        setStartingChatUserId(stu.clerkId);
                        await openConversationWithUser({
                          targetUserId: stu.clerkId,
                          targetUsername: stu.username,
                        });
                        setStartingChatUserId(null);
                      }}
                      className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left hover:bg-[#6C1C74]/5 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-[#6C1C74]/10 border border-[#6C1C74]/20 flex items-center justify-center text-sm font-bold text-[#6C1C74]">
                          {stu.avatar ? (
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            stu.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-gray-900 truncate">
                              {stu.name}
                            </span>
                            {stu.role === "admin" && (
                              <span className="rounded-full bg-[#6C1C74]/10 px-1 py-0.2 text-[9px] font-bold text-[#6C1C74]">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span>@{stu.username}</span>
                            {stu.department && (
                              <span className="truncate">
                                · {stu.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isStarting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#6C1C74]" />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C1C74]/10 px-2.5 py-1 text-[11px] font-semibold text-[#6C1C74]">
                            Chat
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MessagesClient;