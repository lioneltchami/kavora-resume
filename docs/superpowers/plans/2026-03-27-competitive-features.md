# Competitive Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 5 features inspired by self.so to close competitive gaps — PDF upload with AI extraction, dynamic OG images, JSON-LD structured data, custom slug editing, and first-publish celebration.

**Architecture:** Each feature is independent and can be built in parallel. PDF upload is the largest (new packages, API route, UI component). OG images use Vercel's built-in ImageResponse. JSON-LD is a simple script tag. Slug editing adds a modal with debounced availability check. Celebration is a conditional modal on first publish.

**Tech Stack:** pdf-ts, react-dropzone, @vercel/og, Vercel AI SDK (@ai-sdk/anthropic), Zod

---

## Dependencies to Install

```bash
npm install pdf-ts react-dropzone @ai-sdk/anthropic ai zod
```

Note: `@vercel/og` is built into Next.js 16 — no install needed (use `next/og`).

---

## File Structure

```
NEW FILES:
  src/app/api/extract-pdf/route.ts     — PDF upload + AI extraction API
  src/components/PDFUpload.tsx          — Drag-and-drop PDF upload UI
  src/app/r/[slug]/og/route.tsx         — Dynamic OG image generation
  src/components/SlugEditor.tsx         — Custom slug editing modal
  src/components/CelebrationModal.tsx   — First-publish celebration

MODIFIED FILES:
  package.json                          — New dependencies
  src/app/create/page.tsx               — Add PDF upload trigger, slug editor, celebration modal
  src/app/r/[slug]/page.tsx             — Add JSON-LD script, OG image meta
  src/components/ResumeWeb.tsx          — Add JSON-LD structured data
  src/components/LinkedInImport.tsx     — Add PDF upload tab using new PDFUpload component
  src/app/api/suggest/route.ts          — Migrate to Vercel AI SDK (optional, can defer)
  src/app/api/cover-letter/route.ts     — Migrate to Vercel AI SDK (optional, can defer)
```

---

### Task 1: PDF Upload with AI Extraction

**Files:**

- Create: `src/app/api/extract-pdf/route.ts`
- Create: `src/components/PDFUpload.tsx`
- Modify: `src/components/LinkedInImport.tsx`
- Modify: `src/app/create/page.tsx`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/lionel/builders/kavora-resume && npm install pdf-ts react-dropzone zod ai @ai-sdk/anthropic
```

- [ ] **Step 2: Create the PDF extraction API route**

Create `src/app/api/extract-pdf/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { pdfToText } from "pdf-ts";
import { createId } from "@/lib/types";
import type { ResumeData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Allow up to 30s for AI extraction

// Rate limiting (reuse pattern from suggest route)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false; // 5 per minute for PDF extraction
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file || !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 },
      );
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfText = await pdfToText(uint8Array);

    if (!pdfText || pdfText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from PDF. Try pasting the text instead.",
        },
        { status: 400 },
      );
    }

    // Use AI to extract structured resume data
    const resumeData = await extractWithAI(pdfText);

    return NextResponse.json({ data: resumeData });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 },
    );
  }
}

async function extractWithAI(text: string): Promise<Partial<ResumeData>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const prompt = `Extract structured resume data from the following text. Return a JSON object with these exact fields:

{
  "name": "Full Name",
  "location": "City, State/Province",
  "phone": "Phone number",
  "email": "Email address",
  "summary": "Professional summary (3-4 sentences, write one if not present)",
  "skills": ["skill1", "skill2", ...],  // max 12 skills
  "experience": [
    {
      "id": "unique_id",
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["Achievement 1", "Achievement 2", ...]
    }
  ],
  "education": [
    {
      "id": "unique_id",
      "degree": "Degree Name",
      "school": "School Name",
      "location": "City, State"
    }
  ],
  "volunteer": ["Organization 1", "Organization 2"],
  "languages": [{ "name": "English", "level": "Fluent" }]
}

IMPORTANT RULES:
- Generate unique IDs for each experience and education entry (8 random chars)
- Extract ALL work experience entries, ordered most recent first
- For each job, extract or write 3-5 achievement-oriented bullet points with strong action verbs
- If the summary is missing or weak, write a strong professional summary based on the person's experience
- Extract skills from both explicit skills sections and from job descriptions
- Cap skills at 12 most relevant ones
- Return ONLY the JSON object, no markdown, no commentary

RESUME TEXT:
${text.slice(0, 8000)}`;

  if (!apiKey) {
    // Fallback: basic text parsing without AI
    return parseBasicText(text);
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text || "";

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  // Ensure IDs exist
  if (parsed.experience) {
    parsed.experience = parsed.experience.map((e: any) => ({
      ...e,
      id: e.id || createId(),
    }));
  }
  if (parsed.education) {
    parsed.education = parsed.education.map((e: any) => ({
      ...e,
      id: e.id || createId(),
    }));
  }

  return parsed;
}

// Basic fallback parser when no API key
function parseBasicText(text: string): Partial<ResumeData> {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(
    /[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/,
  );

  return {
    name: lines[0]?.length < 50 ? lines[0] : "",
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[0] || "",
    location: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    volunteer: [],
    languages: [],
  };
}
```

- [ ] **Step 3: Create the PDF Upload UI component**

Create `src/components/PDFUpload.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { ResumeData } from "@/lib/types";

interface PDFUploadProps {
  onExtracted: (data: Partial<ResumeData>) => void;
  onError: (msg: string) => void;
}

export default function PDFUpload({ onExtracted, onError }: PDFUploadProps) {
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.name.endsWith(".pdf")) {
        onError("Please upload a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError("File must be under 5MB");
        return;
      }

      setFileName(file.name);
      setProcessing(true);

      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to process PDF");
        }

        const { data } = await res.json();
        onExtracted(data);
      } catch (err: any) {
        onError(err.message || "Failed to process PDF");
      } finally {
        setProcessing(false);
      }
    },
    [onExtracted, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: processing,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? "#b08d57" : "#d4cfc8"}`,
        borderRadius: 8,
        padding: "32px 24px",
        textAlign: "center",
        cursor: processing ? "wait" : "pointer",
        background: isDragActive ? "#b08d5708" : "#faf8f5",
        transition: "all 0.2s ease",
      }}
    >
      <input {...getInputProps()} />
      {processing ? (
        <div>
          <div
            style={{
              width: 32,
              height: 32,
              margin: "0 auto 12px",
              border: "3px solid #e8e2da",
              borderTopColor: "#1e2a3a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: "0.85rem", color: "#1b1b1b", fontWeight: 500 }}>
            Extracting resume data from {fileName}...
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b6560", marginTop: 4 }}>
            AI is reading your resume. This takes a few seconds.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b08d57"
            strokeWidth="1.5"
            style={{ margin: "0 auto 12px", display: "block" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p style={{ fontSize: "0.9rem", color: "#1b1b1b", fontWeight: 500 }}>
            {isDragActive ? "Drop your PDF here" : "Drop your resume PDF here"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b6560", marginTop: 4 }}>
            or click to browse. PDF files up to 5MB.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Integrate PDF upload into the LinkedInImport modal**

Modify `src/components/LinkedInImport.tsx`:

Add a third tab "Upload PDF" that renders the `<PDFUpload>` component. Import `PDFUpload` and wire it to the existing `onImport` flow. When `PDFUpload.onExtracted` fires, transition to the preview stage showing what was extracted, same as the existing text-paste flow.

- [ ] **Step 5: Add a prominent "Upload Resume" button to the editor**

Modify `src/app/create/page.tsx`:

Add a button in the top bar near "Try Sample" and "Import" that says "Upload PDF" and opens the LinkedInImport modal with the PDF tab pre-selected. Add a prop to LinkedInImport: `defaultTab?: "paste" | "upload" | "pdf"`.

- [ ] **Step 6: Build and verify**

```bash
cd /Users/lionel/builders/kavora-resume && npx next build
```

Expected: Build passes, `/api/extract-pdf` route appears in the route table.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add PDF upload with AI extraction for zero-typing resume import"
```

---

### Task 2: Dynamic OG Images

**Files:**

- Create: `src/app/r/[slug]/og/route.tsx`
- Modify: `src/app/r/[slug]/page.tsx`

- [ ] **Step 1: Create the OG image generation route**

Create `src/app/r/[slug]/og/route.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

export const runtime = "edge";

// Hardcoded reena data for the example (same as in page.tsx)
const REENA_NAME = "Reena Sumputh";
const REENA_TITLE = "Customer Service Professional";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let name = REENA_NAME;
  let title = REENA_TITLE;
  let paletteId = "classic-navy";
  let photo: string | undefined;

  if (slug !== "reena") {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("resumes")
        .select("data")
        .eq("slug", slug)
        .single();

      if (data?.data) {
        const resume = data.data as ResumeData;
        name = resume.name || "Resume";
        title =
          resume.experience?.[0]?.title || resume.summary?.slice(0, 60) || "";
        paletteId = resume.paletteId;
        photo = resume.photo;
      }
    } catch {
      // Fall through with defaults
    }
  }

  const palette = getPalette(paletteId);

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${palette.headerBg} 0%, ${palette.primary} 100%)`,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {photo && (
        <img
          src={photo}
          width={80}
          height={80}
          style={{
            borderRadius: "50%",
            border: `3px solid ${palette.accent}`,
            marginBottom: 16,
          }}
        />
      )}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.5px",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {name}
      </div>
      {title && (
        <div
          style={{
            fontSize: 24,
            color: palette.accent,
            marginTop: 12,
            letterSpacing: "0.5px",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: 16,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "2px",
        }}
      >
        KAVORA RESUME BUILDER
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
```

- [ ] **Step 2: Add OG image meta tag to the slug page**

Modify `src/app/r/[slug]/page.tsx` — in the `generateMetadata` function, add the OG image:

```ts
openGraph: {
  title,
  description,
  type: "profile",
  siteName: "Kavora Resume Builder",
  images: [`/r/${slug}/og`],
},
twitter: {
  card: "summary_large_image",
  title,
  description,
  images: [`/r/${slug}/og`],
},
```

Change twitter card from `"summary"` to `"summary_large_image"` to show the full-width image.

- [ ] **Step 3: Build and verify**

```bash
cd /Users/lionel/builders/kavora-resume && npx next build
```

Expected: `/r/[slug]/og` appears as an edge function route.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add dynamic OG images for personalized social sharing cards"
```

---

### Task 3: JSON-LD Structured Data

**Files:**

- Modify: `src/components/ResumeWeb.tsx`

- [ ] **Step 1: Add JSON-LD script to ResumeWeb component**

Modify `src/components/ResumeWeb.tsx`. Inside the return statement, before the `<div className="rw-root">`, add:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: data.name,
      jobTitle: data.experience?.[0]?.title || undefined,
      worksFor: data.experience?.[0]?.company
        ? { "@type": "Organization", name: data.experience[0].company }
        : undefined,
      address: data.location
        ? { "@type": "PostalAddress", addressLocality: data.location }
        : undefined,
      email: data.email || undefined,
      telephone: data.phone || undefined,
      knowsLanguage: data.languages?.map((l) => l.name) || undefined,
      knowsAbout: data.skills || undefined,
      description: data.summary || undefined,
      url: slug ? `https://kavora-resume.vercel.app/r/${slug}` : undefined,
    }),
  }}
/>
```

Place this inside the outermost `<>` fragment, before the `<style>` tag.

- [ ] **Step 2: Build and verify**

```bash
cd /Users/lionel/builders/kavora-resume && npx next build
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add JSON-LD structured data for SEO on public resume pages"
```

---

### Task 4: Custom Slug Editing

**Files:**

- Create: `src/components/SlugEditor.tsx`
- Modify: `src/app/create/page.tsx`
- Modify: `src/app/api/resume/route.ts`

- [ ] **Step 1: Create the SlugEditor component**

Create `src/components/SlugEditor.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";

interface SlugEditorProps {
  currentSlug: string;
  onSave: (newSlug: string) => void;
  onClose: () => void;
}

export default function SlugEditor({
  currentSlug,
  onSave,
  onClose,
}: SlugEditorProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(
    async (s: string) => {
      if (!s || s === currentSlug) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      try {
        const res = await fetch(`/api/resume?slug=${s}`);
        setAvailable(res.status === 404); // 404 means available
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    },
    [currentSlug],
  );

  // Debounced check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug && slug !== currentSlug) {
        checkAvailability(slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, currentSlug, checkAvailability]);

  const handleSave = () => {
    if (slug && (slug === currentSlug || available)) {
      onSave(slug);
    }
  };

  const sanitize = (v: string) =>
    v
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 4,
          padding: 24,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#1e2a3a",
            marginBottom: 16,
          }}
        >
          Customize Your URL
        </h3>
        <div style={{ fontSize: "0.8rem", color: "#6b6560", marginBottom: 12 }}>
          kavora-resume.vercel.app/r/
        </div>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(sanitize(e.target.value))}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: "0.9rem",
            border: "1px solid #e8e2da",
            borderRadius: 4,
            outline: "none",
            fontFamily: "monospace",
          }}
          placeholder="your-custom-url"
        />
        <div style={{ fontSize: "0.75rem", marginTop: 6, height: 20 }}>
          {checking && (
            <span style={{ color: "#6b6560" }}>Checking availability...</span>
          )}
          {!checking && available === true && (
            <span style={{ color: "#22c55e" }}>✓ Available</span>
          )}
          {!checking && available === false && (
            <span style={{ color: "#ef4444" }}>✗ Already taken</span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              fontSize: "0.8rem",
              color: "#6b6560",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!slug || (slug !== currentSlug && !available)}
            style={{
              padding: "8px 20px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "white",
              background: "#1e2a3a",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              opacity: !slug || (slug !== currentSlug && !available) ? 0.5 : 1,
            }}
          >
            Save URL
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add slug editor trigger to the Share modal**

Modify `src/app/create/page.tsx`: In the share modal (shown after successful publish), add a small "Edit URL" link below the share URL. Clicking it opens the `<SlugEditor>` component. When saved, update the slug in Supabase (POST to `/api/resume` with the new slug and existing data) and update the share URL.

- [ ] **Step 3: Add slug rename support to the resume API**

Modify `src/app/api/resume/route.ts`: Add a PATCH handler or modify the POST handler to support updating a resume's slug. When a user changes their slug, the old slug row should be deleted and a new one created with the new slug (or update the slug column directly if unique constraint allows).

- [ ] **Step 4: Build and verify**

```bash
cd /Users/lionel/builders/kavora-resume && npx next build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add custom URL slug editing with availability checking"
```

---

### Task 5: First-Publish Celebration Modal

**Files:**

- Create: `src/components/CelebrationModal.tsx`
- Modify: `src/app/create/page.tsx`

- [ ] **Step 1: Create the CelebrationModal component**

Create `src/components/CelebrationModal.tsx`:

```tsx
"use client";

import { useState } from "react";

interface CelebrationModalProps {
  url: string;
  name: string;
  onClose: () => void;
}

export default function CelebrationModal({
  url,
  name,
  onClose,
}: CelebrationModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 8,
          padding: "40px 32px",
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
          animation: "celebrateIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Animated checkmark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e2a3a, #2d4a3e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            animation:
              "celebratePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#1e2a3a",
            marginBottom: 8,
          }}
        >
          Your Resume is Live!
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6b6560",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Congratulations, {name.split(" ")[0] || "there"}! Your professional
          resume is now published and ready to share.
        </p>

        {/* URL display */}
        <div
          style={{
            background: "#faf8f5",
            border: "1px solid #e8e2da",
            borderRadius: 4,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: "0.8rem",
            color: "#1e2a3a",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {url}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              padding: "10px 20px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "#1e2a3a",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "white",
              color: "#1e2a3a",
              border: "1.5px solid #1e2a3a",
              borderRadius: 4,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            View Resume
          </a>
        </div>

        {/* Share row */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#6b6560",
              fontSize: "0.7rem",
              textDecoration: "none",
            }}
          >
            Share on LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out my resume: ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#6b6560",
              fontSize: "0.7rem",
              textDecoration: "none",
            }}
          >
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just published my resume!`)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#6b6560",
              fontSize: "0.7rem",
              textDecoration: "none",
            }}
          >
            X / Twitter
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            fontSize: "0.75rem",
            color: "#9a9590",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Done
        </button>

        <style>{`
          @keyframes celebrateIn {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes celebratePop {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate celebration into the publish flow**

Modify `src/app/create/page.tsx`: In the `handleSaveAndShare` function, after a successful save, check if this is a first-time publish (not editing an existing resume). If `!editSlug`, show the `CelebrationModal` instead of the plain share modal. Store a flag in localStorage (`kavora-first-publish-done`) to only show it once per resume.

Import `CelebrationModal` and add state:

```ts
const [showCelebration, setShowCelebration] = useState(false);
```

In the publish success block:

```ts
if (!editSlug) {
  setShowCelebration(true); // First publish — celebrate!
} else {
  setShowShareModal(true); // Editing — just show share modal
}
```

Render:

```tsx
{
  showCelebration && shareUrl && (
    <CelebrationModal
      url={shareUrl}
      name={data.name}
      onClose={() => setShowCelebration(false)}
    />
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/lionel/builders/kavora-resume && npx next build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add first-publish celebration modal with social sharing"
```

---

## Self-Review Checklist

1. **Spec coverage:** All 5 features (PDF upload, dynamic OG images, JSON-LD, custom slugs, celebration) have dedicated tasks. ✓
2. **Placeholder scan:** All code blocks are complete. No TBD/TODO. ✓
3. **Type consistency:** `ResumeData` interface is used consistently across all tasks. `createId()` from types.ts used for ID generation. `getPalette()` used in OG image route. ✓
4. **Dependencies:** `pdf-ts`, `react-dropzone`, `zod`, `ai`, `@ai-sdk/anthropic` installed in Task 1 Step 1. `@vercel/og` is built into Next.js (imported as `next/og`). ✓
5. **File conflicts:** Tasks touch different files — no parallel conflicts. Exception: Task 4 and Task 5 both modify `create/page.tsx` but in different sections (share modal vs publish handler). ✓
