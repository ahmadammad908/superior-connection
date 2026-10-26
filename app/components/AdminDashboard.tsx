"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  Power,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Swords,
  Vote as VoteIcon,
  Zap,
  ImageIcon,
} from "lucide-react";

type Student = {
  _id: string;
  name: string;
  department?: string;
  imageUrl: string;
};
type Pair = {
  _id: string;
  leftId: string;
  rightId: string;
  active: boolean;
  round: number;
};
type Toast = { type: "success" | "error"; text: string } | null;
type Confirm = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
} | null;

const BRAND = "#6C1C74";

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} />;
}

/* Pair row ke andar ek student (mobile par avatar upar, naam neeche) */
function PairStudent({ s }: { s?: Student }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2 sm:text-left">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-8 sm:w-8">
        {s?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
        )}
      </div>
      <span
        className="w-full min-w-0 truncate text-xs font-medium sm:text-sm"
        title={s?.name}
      >
        {s?.name || "?"}
      </span>
    </div>
  );
}

export function AdminDashboard({
  initialStudents,
  initialPairs,
  voteCounts,
}: {
  initialStudents: Student[];
  initialPairs: Pair[];
  voteCounts: Record<string, number>;
}) {
  const router = useRouter();

  const [students, setStudents] = useState(initialStudents);
  const [pairs, setPairs] = useState(initialPairs);
  const [counts, setCounts] = useState(voteCounts);

  const [pending, setPending] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [confirming, setConfirming] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  // keep vote counts in sync after router.refresh()
  useEffect(() => setCounts(voteCounts), [voteCounts]);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // image preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isPending = (key: string) => pending.has(key);
  const startPending = (key: string) =>
    setPending((p) => new Set(p).add(key));
  const stopPending = (key: string) =>
    setPending((p) => {
      const n = new Set(p);
      n.delete(key);
      return n;
    });

  const notify = (type: "success" | "error", text: string) =>
    setToast({ type, text });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, p] = await Promise.all([
        fetch("/api/admin/students", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/pairs", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setStudents(s.students || []);
      setPairs(p.pairs || []);
      router.refresh(); // updates vote counts
    } catch {
      notify("error", "Could not refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  async function uploadImage(f: File): Promise<{ url: string; publicId: string }> {
    const sigRes = await fetch("/api/admin/upload");
    if (!sigRes.ok) throw new Error("Could not get upload signature");
    const sig = await sigRes.json();
    const form = new FormData();
    form.append("file", f);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("folder", sig.folder);
    form.append("signature", sig.signature);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return notify("error", "Name and photo are required");
    startPending("add-student");
    try {
      const img = await uploadImage(file);
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          department,
          imageUrl: img.url,
          imagePublicId: img.publicId,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add student");
      setName("");
      setDepartment("");
      setFile(null);
      notify("success", "Student added");
      await refresh();
    } catch (e: any) {
      notify("error", e.message);
    } finally {
      stopPending("add-student");
    }
  }

  async function createPair(e: React.FormEvent) {
    e.preventDefault();
    if (!leftId || !rightId || leftId === rightId)
      return notify("error", "Pick two different students");
    startPending("add-pair");
    try {
      const res = await fetch("/api/admin/pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leftId, rightId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create pair");
      setLeftId("");
      setRightId("");
      notify("success", "Pair created");
      await refresh();
    } catch (e: any) {
      notify("error", e.message);
    } finally {
      stopPending("add-pair");
    }
  }

  async function togglePair(id: string, active: boolean) {
    const key = `toggle:${id}`;
    startPending(key);
    try {
      const res = await fetch(`/api/admin/pairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      notify("success", active ? "Pair activated" : "Pair deactivated");
      await refresh();
    } catch (e: any) {
      notify("error", e.message);
    } finally {
      stopPending(key);
    }
  }

  function askResetPair(id: string) {
    setConfirm({
      title: "Reset votes?",
      message: "All votes for this pair will be removed and users can vote again.",
      confirmLabel: "Reset votes",
      onConfirm: async () => {
        const key = `reset:${id}`;
        startPending(key);
        try {
          const res = await fetch(`/api/admin/pairs/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reset: true }),
          });
          if (!res.ok) throw new Error((await res.json()).error || "Reset failed");
          notify("success", "Votes reset");
          await refresh();
        } catch (e: any) {
          notify("error", e.message);
        } finally {
          stopPending(key);
        }
      },
    });
  }

  function askDeletePair(id: string) {
    setConfirm({
      title: "Delete this pair?",
      message: "The pair and all of its votes will be permanently deleted.",
      confirmLabel: "Delete pair",
      onConfirm: async () => {
        const key = `delete-pair:${id}`;
        startPending(key);
        try {
          const res = await fetch(`/api/admin/pairs/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
          setPairs((prev) => prev.filter((p) => p._id !== id)); // instant removal
          notify("success", "Pair deleted");
          await refresh();
        } catch (e: any) {
          notify("error", e.message);
        } finally {
          stopPending(key);
        }
      },
    });
  }

  function askDeleteStudent(id: string) {
    setConfirm({
      title: "Delete this student?",
      message: "The student will be permanently deleted.",
      confirmLabel: "Delete student",
      onConfirm: async () => {
        const key = `delete-student:${id}`;
        startPending(key);
        try {
          const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
          setStudents((prev) => prev.filter((s) => s._id !== id)); // instant removal
          setPairs((prev) => prev.filter((p) => p.leftId !== id && p.rightId !== id));
          notify("success", "Student deleted");
          await refresh();
        } catch (e: any) {
          notify("error", e.message);
        } finally {
          stopPending(key);
        }
      },
    });
  }

  async function runConfirm() {
    if (!confirm) return;
    setConfirming(true);
    const action = confirm.onConfirm;
    setConfirm(null);
    setConfirming(false);
    await action();
  }

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const activePairs = pairs.filter((p) => p.active).length;

  // text-base on mobile: iPhone par input focus karne par zoom nahi hota
  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-[#6C1C74] focus:ring-2 focus:ring-[#6C1C74]/15 sm:text-sm";
  const primaryBtn =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C1C74] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2.5";
  const rowBtn =
    "inline-flex min-w-[7rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-60 sm:flex-none sm:py-1.5";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 top-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg sm:inset-x-auto sm:right-4 sm:max-w-sm ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="min-w-0 flex-1 break-words">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Close"
            className="ml-1 shrink-0 p-1 opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold">{confirm.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{confirm.message}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 sm:w-auto sm:py-2"
              >
                Cancel
              </button>
              <button
                onClick={runConfirm}
                disabled={confirming}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto sm:py-2"
              >
                {confirming && <Spinner />} {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Students", value: students.length, icon: Users },
          { label: "Pairs", value: pairs.length, icon: Swords },
          { label: "Active pairs", value: activePairs, icon: Zap },
          { label: "Total votes", value: totalVotes, icon: VoteIcon },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:gap-3 sm:p-4"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
              style={{ backgroundColor: `${BRAND}15`, color: BRAND }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-none sm:text-xl">
                {value}
              </p>
              <p className="mt-1 truncate text-[11px] text-gray-500 sm:text-xs">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Add Student */}
        <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Add Student</h2>
          <form onSubmit={addStudent} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={inputCls}
            />
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department (optional)"
              className={inputCls}
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 px-3.5 py-3 text-sm text-gray-600 transition hover:border-[#6C1C74] hover:bg-purple-50/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <span className="min-w-0 flex-1 truncate">
                {file ? file.name : "Choose photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button disabled={isPending("add-student")} className={primaryBtn}>
              {isPending("add-student") ? (
                <>
                  <Spinner /> Uploading & saving…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Student
                </>
              )}
            </button>
          </form>
        </section>

        {/* Create Pair */}
        <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Create Pair</h2>
          <form onSubmit={createPair} className="space-y-3">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className={inputCls}
            >
              <option value="">Left student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className={inputCls}
            >
              <option value="">Right student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id} disabled={s._id === leftId}>
                  {s.name}
                </option>
              ))}
            </select>
            <button disabled={isPending("add-pair")} className={primaryBtn}>
              {isPending("add-pair") ? (
                <>
                  <Spinner /> Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Pair
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Students list */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Students ({students.length})</h2>
          {refreshing && <Spinner className="h-4 w-4 text-[#6C1C74]" />}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => {
            const deleting = isPending(`delete-student:${s._id}`);
            return (
              <div
                key={s._id}
                className={`flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 p-3 transition ${
                  deleting ? "opacity-50" : "hover:shadow-sm"
                }`}
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {s.department || "—"} · {counts[s._id] || 0} votes
                  </p>
                </div>
                <button
                  onClick={() => askDeleteStudent(s._id)}
                  disabled={deleting}
                  className="shrink-0 rounded-lg p-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                  aria-label="Delete student"
                >
                  {deleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
          {students.length === 0 && !refreshing && (
            <p className="text-sm text-gray-500">No students yet.</p>
          )}
          {students.length === 0 &&
            refreshing &&
            [0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
        </div>
      </section>

      {/* Pairs list */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Pairs ({pairs.length})</h2>
          {refreshing && <Spinner className="h-4 w-4 text-[#6C1C74]" />}
        </div>
        <div className="space-y-3">
          {pairs.map((p) => {
            const l = students.find((s) => s._id === p.leftId);
            const r = students.find((s) => s._id === p.rightId);
            const toggling = isPending(`toggle:${p._id}`);
            const resetting = isPending(`reset:${p._id}`);
            const deleting = isPending(`delete-pair:${p._id}`);
            return (
              <div
                key={p._id}
                className={`flex flex-col gap-3 rounded-xl border border-gray-100 p-3 text-sm transition sm:p-4 lg:flex-row lg:items-center lg:gap-4 ${
                  deleting ? "opacity-50" : ""
                }`}
              >
                {/* Students: left vs right */}
                <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 lg:max-w-md lg:flex-1">
                  <PairStudent s={l} />
                  <span className="text-xs font-semibold text-gray-400">vs</span>
                  <PairStudent s={r} />
                </div>

                {/* Status + round */}
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 lg:justify-start lg:border-0 lg:pt-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">Round {p.round}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:ml-auto lg:flex-nowrap">
                  <button
                    onClick={() => togglePair(p._id, !p.active)}
                    disabled={toggling || deleting}
                    className={`${rowBtn} border-gray-200 hover:bg-gray-50`}
                  >
                    {toggling ? (
                      <Spinner className="h-3 w-3" />
                    ) : (
                      <Power className="h-3 w-3" />
                    )}
                    {p.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => askResetPair(p._id)}
                    disabled={resetting || deleting}
                    className={`${rowBtn} border-gray-200 hover:bg-gray-50`}
                  >
                    {resetting ? (
                      <Spinner className="h-3 w-3" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Reset votes
                  </button>
                  <button
                    onClick={() => askDeletePair(p._id)}
                    disabled={deleting}
                    className={`${rowBtn} border-red-200 text-red-600 hover:bg-red-50`}
                  >
                    {deleting ? (
                      <Spinner className="h-3 w-3" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {pairs.length === 0 && !refreshing && (
            <p className="text-sm text-gray-500">No pairs yet.</p>
          )}
          {pairs.length === 0 &&
            refreshing &&
            [0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
        </div>
      </section>
    </div>
  );
}