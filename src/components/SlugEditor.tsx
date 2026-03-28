"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SlugEditorProps {
  currentSlug: string;
  onSave: (newSlug: string) => void;
  onClose: () => void;
}

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error";

export default function SlugEditor({
  currentSlug,
  onSave,
  onClose,
}: SlugEditorProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const sanitize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-/, "");

  const checkAvailability = useCallback(
    async (candidate: string) => {
      if (!candidate || candidate === currentSlug) {
        setStatus("idle");
        return;
      }

      setStatus("checking");
      try {
        const res = await fetch(
          `/api/resume?slug=${encodeURIComponent(candidate)}`,
        );
        if (res.status === 404) {
          setStatus("available");
        } else if (res.ok) {
          setStatus("taken");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [currentSlug],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitize(e.target.value);
    setSlug(sanitized);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!sanitized || sanitized === currentSlug) {
      setStatus("idle");
      return;
    }

    debounceRef.current = setTimeout(() => {
      checkAvailability(sanitized);
    }, 500);
  }

  async function handleSave() {
    if (!slug || slug === currentSlug || status === "taken" || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldSlug: currentSlug, newSlug: slug }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          setStatus("taken");
        } else {
          alert(err.error || "Failed to update slug");
        }
        return;
      }

      onSave(slug);
    } catch {
      alert("Failed to update URL. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && canSave) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  const canSave =
    slug.length > 0 &&
    slug !== currentSlug &&
    status !== "taken" &&
    status !== "checking" &&
    !saving;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-[#1e2a3a]">
          Customize your URL
        </h3>
        <p className="mb-4 text-xs text-[#6b6560]">
          Choose a memorable slug for your resume link.
        </p>

        {/* URL input */}
        <div className="mb-3 flex items-center gap-0 rounded-lg border border-[#e8e2da] bg-[#faf8f5] overflow-hidden">
          <span className="shrink-0 bg-[#e8e2da] px-3 py-2.5 text-xs text-[#6b6560] select-none">
            kavora-resume.vercel.app/r/
          </span>
          <input
            ref={inputRef}
            type="text"
            value={slug}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={80}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#1e2a3a] outline-none placeholder:text-[#c0b8b0]"
            placeholder="your-custom-slug"
          />
        </div>

        {/* Availability indicator */}
        <div className="mb-4 h-5">
          {status === "checking" && (
            <span className="text-xs text-[#6b6560]">Checking...</span>
          )}
          {status === "available" && (
            <span className="text-xs text-green-600">&#10003; Available</span>
          )}
          {status === "taken" && (
            <span className="text-xs text-red-500">&#10007; Already taken</span>
          )}
          {status === "error" && (
            <span className="text-xs text-red-500">
              Could not check availability
            </span>
          )}
          {status === "idle" && slug === currentSlug && (
            <span className="text-xs text-[#9a9590]">Current URL</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#4a4540] transition-colors hover:bg-[#f5f0ea]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-lg bg-[#b08d57] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9a7a4a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
