"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import ATSChecker from "@/components/ATSChecker";
import CelebrationModal from "@/components/CelebrationModal";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import LinkedInImport from "@/components/LinkedInImport";
import PDFDownload from "@/components/PDFDownload";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import SlugEditor from "@/components/SlugEditor";
import UserMenu from "@/components/UserMenu";
import { sampleResume } from "@/lib/sample-data";
import { slugify } from "@/lib/slugify";
import type { ResumeData } from "@/lib/types";
import { emptyResume } from "@/lib/types";

const STORAGE_KEY = "kavora-resume-draft";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type ActiveTab = "edit" | "preview";

function CreatePageInner() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  const [data, setData] = useState<ResumeData>(emptyResume);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("edit");
  const [showATSChecker, setShowATSChecker] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedInDefaultTab, setLinkedInDefaultTab] = useState<
    "paste" | "upload" | "pdf"
  >("paste");
  const [showSlugEditor, setShowSlugEditor] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount (skip if editing from Supabase)
  useEffect(() => {
    const isNew = searchParams.get("new");
    if (isNew) {
      localStorage.removeItem(STORAGE_KEY);
      setData(emptyResume);
      setMounted(true);
      return;
    }
    if (editSlug) {
      setMounted(true);
      return; // Skip localStorage, will load from Supabase instead
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ResumeData;
        setData(parsed);
      }
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, [editSlug, searchParams]);

  // Load resume from Supabase when editing
  useEffect(() => {
    if (!editSlug) return;

    async function loadResume() {
      try {
        const res = await fetch(`/api/resume?slug=${editSlug}`);
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            setData(result.data);
            // Also save to localStorage so it persists
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
          }
        }
      } catch (err) {
        console.error("Failed to load resume for editing:", err);
      }
    }

    loadResume();
  }, [editSlug]);

  // Auto-save to localStorage (debounced)
  const saveToLocalStorage = useCallback((resume: ResumeData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 500);
    setSaveStatus("saving");
  }, []);

  function handleLoadSample() {
    if (
      data.name.trim() &&
      !window.confirm(
        "This will replace your current data with sample content. Continue?",
      )
    )
      return;
    setData(sampleResume);
    saveToLocalStorage(sampleResume);
  }

  function handleChange(updated: ResumeData) {
    setData(updated);
    saveToLocalStorage(updated);
  }

  function handleLinkedInImport(imported: Partial<ResumeData>) {
    const merged: ResumeData = {
      ...data,
      ...imported,
      slug: data.slug,
      paletteId: data.paletteId,
      layoutId: data.layoutId,
    };
    setData(merged);
    saveToLocalStorage(merged);
    setShowLinkedIn(false);
  }

  async function handleSaveAndShare() {
    if (!data.name.trim()) {
      alert("Please enter your name before sharing.");
      return;
    }

    setPublishing(true);
    try {
      const slug =
        editSlug ||
        slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6);
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, data: { ...data, slug } }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      // Save to local resume registry
      const savedResumes = JSON.parse(
        localStorage.getItem("kavora-saved-resumes") || "[]",
      );
      const existing = savedResumes.findIndex(
        (r: { slug: string }) => r.slug === slug,
      );
      const entry = {
        slug,
        name: data.name,
        savedAt: new Date().toISOString(),
        paletteId: data.paletteId,
      };
      if (existing >= 0) {
        savedResumes[existing] = entry;
      } else {
        savedResumes.unshift(entry);
      }
      localStorage.setItem(
        "kavora-saved-resumes",
        JSON.stringify(savedResumes),
      );

      const url = `${window.location.origin}/r/${slug}`;
      setShareUrl(url);
      if (!editSlug) {
        setShowCelebration(true);
      } else {
        setShowShareModal(true);
      }
      setCopied(false);
    } catch (err) {
      console.error("Save & share failed:", err);
      alert("Failed to publish resume. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#faf8f5]">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8e2da] bg-white px-4 shadow-sm">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.03em] text-[#1b1b1b]"
        >
          <Image src="/kavora-logo.png" alt="Kavora" width={22} height={19} />
          <span className="hidden sm:inline">Kavora Resume Builder</span>
          <span className="sm:hidden">Kavora</span>
        </Link>

        {/* Center: Save status */}
        <div className="hidden items-center gap-1.5 text-sm text-[#6b6560] sm:flex">
          {saveStatus === "saving" && (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <svg
                className="h-4 w-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-green-600">All changes saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <span className="text-red-500">Failed to save locally</span>
          )}
          {saveStatus === "idle" && (
            <span>
              {editSlug ? `Editing: ${data.name || editSlug}` : "Ready"}
            </span>
          )}
        </div>

        {/* Try Sample + Import */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1 text-[0.75rem] text-[#6b6560] hover:text-[#b08d57] transition-colors"
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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
            Try Sample
          </button>
          <button
            onClick={() => {
              setLinkedInDefaultTab("pdf");
              setShowLinkedIn(true);
            }}
            className="inline-flex items-center gap-1 text-[0.75rem] text-[#6b6560] hover:text-[#b08d57] transition-colors"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            Upload PDF
          </button>
          <button
            onClick={() => {
              setLinkedInDefaultTab("paste");
              setShowLinkedIn(true);
            }}
            className="inline-flex items-center gap-1 text-[0.75rem] text-[#6b6560] hover:text-[#b08d57] transition-colors"
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Import
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowATSChecker(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#d4cfc8] bg-white px-3 py-2 text-[0.8rem] font-medium text-[#4a4540] transition-colors hover:border-[#b08d57] hover:text-[#b08d57]"
          >
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ATS Check
          </button>
          <button
            onClick={() => setShowCoverLetter(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#d4cfc8] bg-white px-3 py-2 text-[0.8rem] font-medium text-[#4a4540] transition-colors hover:border-[#b08d57] hover:text-[#b08d57]"
          >
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
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            Cover Letter
          </button>
          <PDFDownload name={data.name} data={data} />
          <button
            onClick={handleSaveAndShare}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a3a] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                Publishing...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
                Save &amp; Share
              </>
            )}
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="flex border-b border-[#e8e2da] bg-white md:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "border-b-2 border-[#1e2a3a] text-[#1b1b1b]"
              : "text-[#6b6560] hover:text-[#4a4540]"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-[#1e2a3a] text-[#1b1b1b]"
              : "text-[#6b6560] hover:text-[#4a4540]"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Split pane */}
      <div className="flex min-h-0 flex-1">
        {/* Left pane: Form */}
        <div
          className={`w-full overflow-y-auto bg-[#faf8f5] md:w-[45%] ${
            activeTab !== "edit" ? "hidden md:block" : ""
          }`}
        >
          <div className="mx-auto max-w-2xl p-6">
            <ResumeForm data={data} onChange={handleChange} />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden w-px bg-[#e8e2da] md:block" />

        {/* Right pane: Preview */}
        <div
          className={`w-full overflow-y-auto bg-[#f5f0ea] md:w-[55%] ${
            activeTab !== "preview" ? "hidden md:block" : ""
          }`}
        >
          <div className="flex min-h-full items-start justify-center p-6">
            <ResumePreview data={data} />
          </div>
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1b1b1b]">
                Resume Published!
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1 text-[#9a9590] transition-colors hover:bg-[#f5f0ea] hover:text-[#6b6560]"
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

            <p className="mb-4 text-sm text-[#6b6560]">
              Your resume is live. Share this link with anyone:
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-[#e8e2da] bg-[#faf8f5] p-3">
              <span className="flex-1 truncate text-sm text-[#4a4540]">
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-[#1e2a3a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2d3f54]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => setShowSlugEditor(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#b08d57] transition-colors hover:text-[#9a7a4a]"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                />
              </svg>
              Edit URL
            </button>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#4a4540] transition-colors hover:bg-[#f5f0ea]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slug Editor modal */}
      {showSlugEditor && shareUrl && (
        <SlugEditor
          currentSlug={shareUrl.split("/r/")[1] || ""}
          onSave={(newSlug) => {
            const newUrl = `${window.location.origin}/r/${newSlug}`;
            setShareUrl(newUrl);
            setShowSlugEditor(false);
            setCopied(false);
            // Update local registry
            const savedResumes = JSON.parse(
              localStorage.getItem("kavora-saved-resumes") || "[]",
            );
            const oldSlug = shareUrl.split("/r/")[1] || "";
            const idx = savedResumes.findIndex(
              (r: { slug: string }) => r.slug === oldSlug,
            );
            if (idx >= 0) {
              savedResumes[idx].slug = newSlug;
              localStorage.setItem(
                "kavora-saved-resumes",
                JSON.stringify(savedResumes),
              );
            }
          }}
          onClose={() => setShowSlugEditor(false)}
        />
      )}

      {/* ATS Checker modal */}
      {showATSChecker && (
        <ATSChecker data={data} onClose={() => setShowATSChecker(false)} />
      )}

      {/* Cover Letter Generator modal */}
      {showCoverLetter && (
        <CoverLetterGenerator
          data={data}
          onClose={() => setShowCoverLetter(false)}
        />
      )}

      {/* LinkedIn Import modal */}
      {showLinkedIn && (
        <LinkedInImport
          onImport={handleLinkedInImport}
          onClose={() => setShowLinkedIn(false)}
          defaultTab={linkedInDefaultTab}
        />
      )}

      {/* First-publish celebration modal */}
      {showCelebration && shareUrl && (
        <CelebrationModal
          url={shareUrl}
          name={data.name}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}
