"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { X, Loader2, Camera, User as UserIcon, AlertCircle } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    name: string;
    username: string;
    bio?: string;
    department?: string;
    semester?: string;
    avatar?: string;
  };
  onProfileUpdated: (updated: any) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { user } = useUser();
  const [name, setName] = useState(initialData.name || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [department, setDepartment] = useState(initialData.department || "");
  const [semester, setSemester] = useState(initialData.semester || "");
  const [avatar, setAvatar] = useState(initialData.avatar || "");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar size must be less than 5MB.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      // 1. Upload to Cloudinary for fast CDN image delivery
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar.");
      setAvatar(data.url);

      // 2. Also update Clerk profile image directly
      if (user?.setProfileImage) {
        try {
          await user.setProfileImage({ file });
        } catch (clerkAvatarErr) {
          console.warn("Clerk avatar sync note:", clerkAvatarErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Update database & backend Clerk profile
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          department: department.trim(),
          semester: semester.trim(),
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      // 2. Also sync client Clerk session so UserButton & Clerk hooks update immediately
      if (user) {
        try {
          const parts = name.trim().split(" ");
          await user.update({
            firstName: parts[0] || name.trim(),
            lastName: parts.slice(1).join(" ") || "",
            ...(username.trim() ? { username: username.trim() } : {}),
          });
          await user.reload();
        } catch (clerkSyncErr) {
          console.warn("Clerk client sync note:", clerkSyncErr);
        }
      }

      onProfileUpdated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-[#6C1C74]/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#6C1C74]/10 pb-3">
          <h3 className="text-base font-bold text-gray-900">Edit Profile</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Prominent Red Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-400/30 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#6C1C74]/20 bg-gray-100">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C1C74] hover:underline"
            >
              <Camera className="h-3.5 w-3.5" />
              Change Photo
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="w-full rounded-xl border border-gray-200 py-2 pl-7 pr-3 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, SE, Business, Pharmacy"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Semester / Year
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. Semester 4, Fall 2024, Alumni"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students a bit about yourself, interests, or society..."
              rows={3}
              maxLength={300}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
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
              disabled={saving || uploadingAvatar}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6C1C74] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6C1C74]/20 hover:bg-[#6C1C74]/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
