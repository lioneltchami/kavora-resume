"use client";

import { useRef, useState } from "react";
import type { PortfolioProject, ProjectCategory } from "@/lib/portfolio-types";
import { PROJECT_CATEGORIES } from "@/lib/portfolio-types";

type ProjectDraft = Omit<PortfolioProject, "id" | "user_id" | "created_at"> & {
  id?: string;
};

interface ProjectEditorProps {
  project: ProjectDraft;
  onSave: (project: ProjectDraft) => void;
  onCancel: () => void;
  slug: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProjectEditor({
  project,
  onSave,
  onCancel,
  slug,
}: ProjectEditorProps) {
  const [draft, setDraft] = useState<ProjectDraft>(project);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateField<K extends keyof ProjectDraft>(
    key: K,
    value: ProjectDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileUpload(file: File) {
    setUploadError(null);

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are supported.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const result = (await res.json()) as { url: string };
      updateField("image_url", result.url);
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFileUpload(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave(draft);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[2px] border border-rule bg-paper p-5"
    >
      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="My awesome project"
          required
          className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
          Description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Brief description of the project..."
          rows={3}
          className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
          Category
        </label>
        <select
          value={draft.category}
          onChange={(e) =>
            updateField("category", e.target.value as ProjectCategory)
          }
          className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink bg-paper focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {PROJECT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Image Upload */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
          Project Image
        </label>

        {draft.image_url && (
          <div className="mb-2 relative inline-block">
            <img
              src={draft.image_url}
              alt="Project thumbnail"
              className="h-24 w-auto rounded-[2px] border border-rule object-cover"
            />
            <button
              type="button"
              onClick={() => updateField("image_url", null)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-[2px] border-2 border-dashed px-4 py-6 transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-rule hover:border-accent/50"
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-accent" />
              Uploading...
            </div>
          ) : (
            <>
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
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
              <p className="text-sm text-ink-2">
                Drop image here or click to upload
              </p>
              <p className="mt-1 text-xs text-ink-2">
                JPEG, PNG, or WebP up to 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {uploadError && (
          <p className="mt-1 text-xs text-red-500">{uploadError}</p>
        )}
      </div>

      {/* Live URL */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
          Live URL
        </label>
        <input
          type="url"
          value={draft.live_url ?? ""}
          onChange={(e) => updateField("live_url", e.target.value || null)}
          placeholder="https://..."
          className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!draft.title.trim()}
          className="rounded-[2px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Project
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[2px] px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
