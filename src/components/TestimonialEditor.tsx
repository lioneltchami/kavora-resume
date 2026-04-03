"use client";

import { useState } from "react";
import type { PortfolioTestimonial } from "@/lib/portfolio-types";

type TestimonialDraft = Omit<
  PortfolioTestimonial,
  "id" | "user_id" | "created_at"
> & {
  id?: string;
};

interface TestimonialEditorProps {
  testimonial: TestimonialDraft;
  onSave: (t: TestimonialDraft) => void;
  onCancel: () => void;
}

export default function TestimonialEditor({
  testimonial,
  onSave,
  onCancel,
}: TestimonialEditorProps) {
  const [draft, setDraft] = useState<TestimonialDraft>(testimonial);

  function updateField<K extends keyof TestimonialDraft>(
    key: K,
    value: TestimonialDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.text.trim()) return;
    onSave(draft);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[#e8e2da] bg-white p-5"
    >
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Jane Doe"
          required
          className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
        />
      </div>

      {/* Role */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
          Role
        </label>
        <input
          type="text"
          value={draft.role}
          onChange={(e) => updateField("role", e.target.value)}
          placeholder="Product Manager"
          className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
        />
      </div>

      {/* Company */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
          Company
        </label>
        <input
          type="text"
          value={draft.company}
          onChange={(e) => updateField("company", e.target.value)}
          placeholder="Acme Inc."
          className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
          Avatar URL <span className="text-[#b5b0a8]">(optional)</span>
        </label>
        <input
          type="url"
          value={draft.avatar_url ?? ""}
          onChange={(e) => updateField("avatar_url", e.target.value || null)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
        />
      </div>

      {/* Testimonial Text */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
          Testimonial <span className="text-red-400">*</span>
        </label>
        <textarea
          value={draft.text}
          onChange={(e) => updateField("text", e.target.value)}
          placeholder="What did they say about working with you?"
          rows={4}
          required
          className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!draft.name.trim() || !draft.text.trim()}
          className="rounded-lg bg-[#1e2a3a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Testimonial
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b6560] transition-colors hover:bg-[#f5f0ea] hover:text-[#1b1b1b]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
