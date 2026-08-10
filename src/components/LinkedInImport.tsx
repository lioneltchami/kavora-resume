"use client";

import { useEffect, useRef, useState } from "react";
import PDFUpload from "@/components/PDFUpload";
import { parseLinkedInText, summarizeParsed } from "@/lib/linkedin-parser";
import type { ResumeData } from "@/lib/types";

interface LinkedInImportProps {
  onImport: (data: Partial<ResumeData>) => void;
  onClose: () => void;
  defaultTab?: "paste" | "upload" | "pdf";
}

type Tab = "paste" | "upload" | "pdf";
type Stage = "input" | "preview";

export default function LinkedInImport({
  onImport,
  onClose,
  defaultTab = "paste",
}: LinkedInImportProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [stage, setStage] = useState<Stage>("input");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Partial<ResumeData> | null>(null);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleParse() {
    if (!text.trim()) {
      setError("Please paste your LinkedIn profile text first.");
      return;
    }
    setError("");
    const data = parseLinkedInText(text);
    const hasContent =
      data.name ||
      (data.experience && data.experience.length > 0) ||
      (data.education && data.education.length > 0) ||
      (data.skills && data.skills.length > 0);
    if (!hasContent) {
      setError(
        "Could not extract any resume data. Make sure you copied your full LinkedIn profile text.",
      );
      return;
    }
    setParsed(data);
    setStage("preview");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        // For text-based reading of PDF, try to extract readable content
        // Filter out binary noise and keep readable ASCII/Unicode text
        const readable = content
          .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F]/g, " ")
          .replace(/\s{3,}/g, "\n")
          .trim();
        if (readable.length < 50) {
          setError(
            "Could not extract enough text from this PDF. For best results, open the PDF, select all text (Ctrl+A / Cmd+A), copy it, and paste it in the 'Paste Text' tab.",
          );
          return;
        }
        setText(readable);
        setTab("paste");
        handleParseText(readable);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try pasting the text instead.");
    };
    reader.readAsText(file);
  }

  function handleParseText(inputText: string) {
    const data = parseLinkedInText(inputText);
    const hasContent =
      data.name ||
      (data.experience && data.experience.length > 0) ||
      (data.education && data.education.length > 0) ||
      (data.skills && data.skills.length > 0);
    if (!hasContent) {
      setError(
        "Could not extract resume data from the uploaded PDF. Try opening the PDF, copying all text, and pasting it in the 'Paste Text' tab.",
      );
      return;
    }
    setParsed(data);
    setStage("preview");
  }

  function handleApply() {
    if (parsed) {
      onImport(parsed);
    }
  }

  function handleBack() {
    setStage("input");
    setParsed(null);
    setError("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="flex w-full max-w-lg flex-col rounded-sm bg-paper shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Upload / Import
            </h2>
            <p className="mt-0.5 text-xs text-ink-2">
              Auto-fill your resume from a PDF or LinkedIn profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[2px] p-1 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink-2"
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

        {stage === "input" && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-rule">
              <button
                onClick={() => setTab("paste")}
                className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                  tab === "paste"
                    ? "border-b-2 border-accent text-ink"
                    : "text-ink-2 hover:text-ink-2"
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                  tab === "upload"
                    ? "border-b-2 border-accent text-ink"
                    : "text-ink-2 hover:text-ink-2"
                }`}
              >
                LinkedIn PDF
              </button>
              <button
                onClick={() => setTab("pdf")}
                className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                  tab === "pdf"
                    ? "border-b-2 border-accent text-ink"
                    : "text-ink-2 hover:text-ink-2"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === "paste" && (
                <div className="space-y-3">
                  <div className="rounded-[2px] bg-paper p-3">
                    <p className="text-xs leading-relaxed text-ink-2">
                      Go to your LinkedIn profile, select all text (
                      <kbd className="rounded border border-rule bg-paper px-1 py-0.5 font-mono text-[10px]">
                        Ctrl+A
                      </kbd>{" "}
                      /{" "}
                      <kbd className="rounded border border-rule bg-paper px-1 py-0.5 font-mono text-[10px]">
                        Cmd+A
                      </kbd>
                      ), copy (
                      <kbd className="rounded border border-rule bg-paper px-1 py-0.5 font-mono text-[10px]">
                        Ctrl+C
                      </kbd>{" "}
                      /{" "}
                      <kbd className="rounded border border-rule bg-paper px-1 py-0.5 font-mono text-[10px]">
                        Cmd+C
                      </kbd>
                      ), and paste below.
                    </p>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError("");
                    }}
                    placeholder="Paste your LinkedIn profile text here..."
                    rows={10}
                    className="w-full resize-none rounded-[2px] border border-rule bg-paper p-3 text-sm text-ink placeholder:text-ink-2/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              )}

              {tab === "upload" && (
                <div className="space-y-4">
                  <div className="rounded-[2px] bg-paper p-3">
                    <p className="text-xs leading-relaxed text-ink-2">
                      Go to LinkedIn &rarr; Your Profile &rarr; More &rarr; Save
                      to PDF, then upload it here.
                    </p>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-[2px] border-2 border-dashed border-rule bg-paper p-8 transition-colors hover:border-accent hover:bg-paper-2"
                  >
                    <svg
                      className="mb-2 h-8 w-8 text-ink-2"
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
                    <p className="text-sm font-medium text-ink-2">
                      Click to upload PDF
                    </p>
                    <p className="mt-1 text-xs text-ink-2">
                      or drag and drop
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="rounded-[2px] border border-rule bg-paper p-3">
                    <p className="text-xs leading-relaxed text-ink-2">
                      <strong className="text-ink-2">Tip:</strong> PDF text
                      extraction can be unreliable. For best results, open the
                      PDF, select all text (Ctrl+A / Cmd+A), copy it, and use
                      the &ldquo;Paste Text&rdquo; tab.
                    </p>
                  </div>
                </div>
              )}

              {tab === "pdf" && (
                <div className="space-y-4">
                  <div className="rounded-[2px] bg-paper p-3">
                    <p className="text-xs leading-relaxed text-ink-2">
                      Upload any resume PDF and AI will extract your data
                      automatically. Works with any format.
                    </p>
                  </div>
                  <PDFUpload
                    onExtracted={(data) => {
                      setParsed(data);
                      setStage("preview");
                    }}
                    onError={(msg) => setError(msg)}
                  />
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-[2px] border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-rule px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-[2px] px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2"
              >
                Cancel
              </button>
              {tab === "paste" && (
                <button
                  onClick={handleParse}
                  disabled={!text.trim()}
                  className="rounded-[2px] bg-ink px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Import
                </button>
              )}
            </div>
          </>
        )}

        {stage === "preview" && parsed && (
          <>
            {/* Preview content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-4 rounded-[2px] border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">
                  Successfully extracted data
                </p>
                <p className="mt-1 text-xs text-green-700">
                  {summarizeParsed(parsed)}
                </p>
              </div>

              <div className="space-y-3">
                {parsed.name && (
                  <PreviewSection label="Name" value={parsed.name} />
                )}
                {parsed.email && (
                  <PreviewSection label="Email" value={parsed.email} />
                )}
                {parsed.phone && (
                  <PreviewSection label="Phone" value={parsed.phone} />
                )}
                {parsed.location && (
                  <PreviewSection label="Location" value={parsed.location} />
                )}
                {parsed.summary && (
                  <PreviewSection
                    label="Summary"
                    value={
                      parsed.summary.length > 150
                        ? parsed.summary.slice(0, 150) + "..."
                        : parsed.summary
                    }
                  />
                )}
                {parsed.experience && parsed.experience.length > 0 && (
                  <PreviewSection
                    label={`Experience (${parsed.experience.length})`}
                    value={parsed.experience
                      .map(
                        (e) =>
                          `${e.title}${e.company ? ` at ${e.company}` : ""}`,
                      )
                      .join(", ")}
                  />
                )}
                {parsed.education && parsed.education.length > 0 && (
                  <PreviewSection
                    label={`Education (${parsed.education.length})`}
                    value={parsed.education
                      .map(
                        (e) =>
                          `${e.degree || "Degree"}${e.school ? ` - ${e.school}` : ""}`,
                      )
                      .join(", ")}
                  />
                )}
                {parsed.skills && parsed.skills.length > 0 && (
                  <PreviewSection
                    label={`Skills (${parsed.skills.length})`}
                    value={parsed.skills.join(", ")}
                  />
                )}
                {parsed.languages && parsed.languages.length > 0 && (
                  <PreviewSection
                    label={`Languages (${parsed.languages.length})`}
                    value={parsed.languages
                      .map((l) => `${l.name} (${l.level})`)
                      .join(", ")}
                  />
                )}
                {parsed.volunteer && parsed.volunteer.length > 0 && (
                  <PreviewSection
                    label={`Volunteer (${parsed.volunteer.length})`}
                    value={parsed.volunteer.join(", ")}
                  />
                )}
              </div>

              <div className="mt-4 rounded-[2px] border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">
                  This will merge with your current resume data. Existing
                  palette and layout settings will be preserved.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-rule px-6 py-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1 rounded-[2px] px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2"
              >
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
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Back
              </button>
              <button
                onClick={handleApply}
                className="rounded-[2px] bg-ink px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-light"
              >
                Apply to Resume
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreviewSection({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-rule bg-paper p-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2">
        {label}
      </p>
      <p className="text-sm text-ink-2">{value}</p>
    </div>
  );
}
