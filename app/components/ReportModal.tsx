"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { REPORT_REASONS } from "../lib/constants";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment" | "user";
  targetId: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
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
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#6C1C74]/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#6C1C74]/10 pb-3">
          <div className="flex items-center gap-2 text-[#6C1C74]">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-bold text-gray-900">
              Report {targetType}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#6C1C74]" />
            <h4 className="mt-3 text-sm font-bold text-gray-900">
              Report Submitted
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Thank you for keeping our university community safe. Campus
              moderators will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe why this content violates community guidelines..."
                className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-900 outline-none focus:border-[#6C1C74] focus:ring-1 focus:ring-[#6C1C74]"
                maxLength={500}
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
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
