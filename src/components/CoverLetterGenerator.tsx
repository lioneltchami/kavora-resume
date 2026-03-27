"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/lib/types";

interface CoverLetterGeneratorProps {
  data: ResumeData;
  onClose: () => void;
}

export default function CoverLetterGenerator({
  data,
  onClose,
}: CoverLetterGeneratorProps) {
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  // Build full letter text
  const greeting = `Dear ${hiringManager.trim() || "Hiring Manager"},`;
  const closing = `Sincerely,\n${data.name}${data.phone ? `\n${data.phone}` : ""}${data.email ? `\n${data.email}` : ""}`;
  const fullLetter = `${greeting}\n\n${coverLetter}\n\n${closing}`;

  async function handleGenerate() {
    if (!companyName.trim() || !jobDescription.trim()) {
      setError("Please fill in the company name and job description.");
      return;
    }

    setError("");
    setLoading(true);
    setCoverLetter("");
    setEditing(false);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          jobDescription: jobDescription.trim(),
          companyName: companyName.trim(),
          hiringManager: hiringManager.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate cover letter");
      }

      const result = await res.json();
      setCoverLetter(result.coverLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = fullLetter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    const blob = new Blob([fullLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleEditToggle() {
    setEditing((prev) => !prev);
    if (!editing) {
      // Focus textarea after state update
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e2da] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e2a3a]">
              <svg
                className="h-4 w-4 text-[#b08d57]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#1b1b1b]">
              Cover Letter Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9a9590] transition-colors hover:bg-[#f5f0ea] hover:text-[#6b6560]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Input form */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4a4540]">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-lg border border-[#d4cfc8] bg-white px-3.5 py-2.5 text-sm text-[#1b1b1b] placeholder-[#b5b0a8] outline-none transition-colors focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4a4540]">
                Hiring Manager Name{" "}
                <span className="text-xs font-normal text-[#9a9590]">
                  (Leave blank if unknown)
                </span>
              </label>
              <input
                type="text"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full rounded-lg border border-[#d4cfc8] bg-white px-3.5 py-2.5 text-sm text-[#1b1b1b] placeholder-[#b5b0a8] outline-none transition-colors focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4a4540]">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the full job description here..."
                className="w-full resize-none rounded-lg border border-[#d4cfc8] bg-white px-3.5 py-2.5 text-sm text-[#1b1b1b] placeholder-[#b5b0a8] outline-none transition-colors focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]/30"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                  Generating...
                </>
              ) : coverLetter ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182"
                    />
                  </svg>
                  Regenerate
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                    />
                  </svg>
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-6 space-y-4 rounded-lg border border-[#e8e2da] bg-[#fdfcfa] p-8">
              <div className="h-4 w-40 animate-pulse rounded bg-[#e8e2da]" />
              <div className="space-y-2.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-[85%] animate-pulse rounded bg-[#ede9e3]" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-[70%] animate-pulse rounded bg-[#ede9e3]" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-[90%] animate-pulse rounded bg-[#ede9e3]" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-[#ede9e3]" />
                <div className="h-3.5 w-[50%] animate-pulse rounded bg-[#ede9e3]" />
              </div>
            </div>
          )}

          {/* Cover letter output */}
          {coverLetter && !loading && (
            <div className="mt-6">
              {/* Action buttons */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cfc8] bg-white px-3 py-1.5 text-xs font-medium text-[#4a4540] transition-colors hover:border-[#b08d57] hover:text-[#b08d57]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cfc8] bg-white px-3 py-1.5 text-xs font-medium text-[#4a4540] transition-colors hover:border-[#b08d57] hover:text-[#b08d57]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download as Text
                </button>

                <button
                  onClick={handleEditToggle}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    editing
                      ? "border-[#b08d57] bg-[#b08d57]/10 text-[#b08d57]"
                      : "border-[#d4cfc8] bg-white text-[#4a4540] hover:border-[#b08d57] hover:text-[#b08d57]"
                  }`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  {editing ? "Done Editing" : "Edit"}
                </button>
              </div>

              {/* Letter display */}
              <div
                className="rounded-lg border border-[#d4cfc8] shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #fdfcfa 0%, #f9f6f1 50%, #fdfcfa 100%)",
                }}
              >
                {/* Paper top accent */}
                <div className="h-1 rounded-t-lg bg-gradient-to-r from-[#1e2a3a] via-[#b08d57] to-[#1e2a3a]" />

                <div className="px-8 py-8 sm:px-10 sm:py-10">
                  {editing ? (
                    <div>
                      {/* Greeting (non-editable preview) */}
                      <p
                        className="mb-4 text-[0.95rem] leading-relaxed text-[#2a2520]"
                        style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                        }}
                      >
                        {greeting}
                      </p>

                      <textarea
                        ref={textareaRef}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={16}
                        className="w-full resize-y rounded-lg border border-[#d4cfc8] bg-white/80 px-4 py-3 text-[0.95rem] leading-relaxed text-[#2a2520] outline-none transition-colors focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]/30"
                        style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                        }}
                      />

                      {/* Closing (non-editable preview) */}
                      <p
                        className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-[#2a2520]"
                        style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                        }}
                      >
                        {closing}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="whitespace-pre-line text-[0.95rem] leading-[1.85] text-[#2a2520]"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                      }}
                    >
                      <p className="mb-5 font-semibold">{greeting}</p>

                      {coverLetter.split("\n\n").map((paragraph, i) => (
                        <p key={i} className="mb-5 last:mb-0">
                          {paragraph}
                        </p>
                      ))}

                      <p className="mt-8 whitespace-pre-line">{closing}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
