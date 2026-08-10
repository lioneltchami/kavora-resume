"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/lib/types";
import {
  applyTailorPatch,
  TAILOR_JD_MAX_CHARS,
  type TailorPatch,
} from "@/lib/tailor";
import { slugify } from "@/lib/slugify";

interface JobTargetModalProps {
  data: ResumeData;
  parentSlug?: string | null;
  onClose: () => void;
  onApply: (next: ResumeData) => void;
  onRequestCoverLetter: (input: {
    companyName: string;
    jobDescription: string;
  }) => void;
  onProRequired: () => void;
}

export default function JobTargetModal({
  data,
  parentSlug,
  onClose,
  onApply,
  onRequestCoverLetter,
  onProRequired,
}: JobTargetModalProps) {
  const [companyName, setCompanyName] = useState(data.targetCompany ?? "");
  const [targetRole, setTargetRole] = useState(
    data.targetRole ?? data.title ?? "",
  );
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patch, setPatch] = useState<TailorPatch | null>(null);
  const [fallback, setFallback] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  async function handleTailor() {
    if (!companyName.trim() || !jobDescription.trim()) {
      setError("Company and job description are required.");
      return;
    }
    if (jobDescription.trim().length > TAILOR_JD_MAX_CHARS) {
      setError(
        `Job description must be under ${TAILOR_JD_MAX_CHARS} characters.`,
      );
      return;
    }

    setError("");
    setLoading(true);
    setPatch(null);
    setFallback(false);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          companyName: companyName.trim(),
          targetRole: targetRole.trim() || undefined,
          jobDescription: jobDescription.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        if (result.code === "PRO_REQUIRED") {
          onProRequired();
          return;
        }
        throw new Error(result.error || "Failed to tailor resume");
      }

      setPatch(result.patch as TailorPatch);
      setFallback(Boolean(result.fallback));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleApply(openCoverLetter: boolean) {
    if (!patch) return;

    const baseSlug =
      parentSlug ||
      data.parentSlug ||
      (data.slug && !data.parentSlug ? data.slug : undefined) ||
      slugify(data.name || "resume");

    const companySlug = slugify(companyName || "role").slice(0, 18) || "role";
    const nextSlug = `${slugify(data.name || "resume")}-${companySlug}-${Math.random().toString(36).slice(2, 6)}`;

    const next = applyTailorPatch(data, patch);
    next.slug = nextSlug;
    next.parentSlug = baseSlug;
    next.label = patch.label;
    next.targetCompany = companyName.trim();
    next.targetRole = targetRole.trim() || undefined;
    next.title = targetRole.trim() || next.title;

    onApply(next);
    if (openCoverLetter) {
      onRequestCoverLetter({
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
      });
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm border border-rule bg-paper shadow-xl"
      >
        <div className="border-b border-rule px-6 py-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-accent">
            Hire Loop
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            Tailor for a Job
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            Paste a job description. We rewrite your summary and bullets for
            that role, then save it as a labeled copy so your base resume stays
            intact.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.75rem] font-medium text-ink-2">
                Company
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.75rem] font-medium text-ink-2">
                Target role
              </label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none"
                placeholder="Backend Engineer"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.75rem] font-medium text-ink-2">
              Job description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="w-full rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none"
              placeholder="Paste the full job description here..."
            />
            <p className="mt-1 text-right text-[0.7rem] text-ink-2">
              {jobDescription.length}/{TAILOR_JD_MAX_CHARS}
            </p>
          </div>

          {!patch ? (
            <button
              type="button"
              onClick={handleTailor}
              disabled={loading}
              className="w-full rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light disabled:opacity-50"
            >
              {loading ? "Tailoring..." : "Tailor Resume"}
            </button>
          ) : (
            <div className="space-y-4 rounded-sm border border-rule bg-paper p-4">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-accent">
                  Preview · {patch.label}
                </p>
                {fallback && (
                  <p className="mt-1 text-xs text-ink-2">
                    Used offline fallback because AI was unavailable.
                  </p>
                )}
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                {patch.summary}
              </p>
              {patch.skills && patch.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {patch.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-rule bg-paper px-2.5 py-0.5 text-[0.7rem] text-ink-2"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleApply(false)}
                  className="flex-1 rounded-sm border border-ink px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-white"
                >
                  Apply as Copy
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(true)}
                  className="flex-1 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent"
                >
                  Apply + Cover Letter
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPatch(null)}
                className="w-full text-sm text-ink-2 hover:text-ink"
              >
                Edit job details and try again
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-rule px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-4 py-2 text-sm text-ink-2 hover:bg-paper-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
